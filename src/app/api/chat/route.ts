import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { hybridSearch } from "@/lib/vector-store";

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const { messages }: { messages: { role: string; content: string }[] } = await req.json();
    console.log(`[CHAT] Received request with ${messages?.length} messages.`);
    
    // 1. Get last user message
    const history = messages || [];
    const lastUserMessage = history[history.length - 1]?.content || "";
    console.log(`[CHAT] Last message: "${lastUserMessage.slice(0, 50)}..."`);
    
    if (!lastUserMessage) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // 2. Retrieve relevant chunks using Semantic + Keyword Search
    let queryEmbedding: number[] | undefined;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await embeddingModel.embedContent(lastUserMessage);
      queryEmbedding = result.embedding.values;
    } catch (e) {
      console.warn("[CHAT] Failed to generate query embedding, falling back to keywords:", e);
    }

    const { results, retrievalTime } = await hybridSearch(lastUserMessage, 5, queryEmbedding);
    const context = results.map(c => `[Source: ${c.sourceName}]\n${c.text}`).join("\n\n---\n\n");
    console.log(`[CHAT] Retrieved ${results.length} chunks in ${retrievalTime}ms. (Semantic: ${queryEmbedding ? 'Yes' : 'No'})`);
    
    if (results.length === 0) {
      console.warn("[CHAT] No relevant context found in document store.");
    }

    // 3. Strict Prompt Logic as requested
    const prompt = `
        You are a helpful AI assistant.
        Answer ONLY based on the document.
        If answer is not found, say 'Not found in document'.

        Document:
        ${context}

        Question:
        ${lastUserMessage}
    `.trim();

    // 4. Manual Gemini Call (No SDKs/Streaming)
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // No streaming - Simple JSON response
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      return NextResponse.json({
        role: "assistant",
        content: responseText.trim(),
        metadata: {
          sources: [...new Set(results.map(r => r.sourceName))],
          debug: {
            retrievalTime,
            totalTime: Date.now() - startTime,
            topChunks: results.map(r => ({
              source: r.sourceName,
              text: r.text.slice(0, 100) + "...",
              score: r.score,
              semanticScore: r.semanticScore || 0,
              keywordScore: r.keywordScore || 0
            }))
          }
        }
      });
    } catch (genError) {
      console.error("[CHAT] Gemini failed:", genError);
      return NextResponse.json({
        role: "assistant",
        content: `I found some relevant information in your documents, but my AI engine is having trouble connecting at the moment.\n\n**Raw Context found:**\n\n${context.slice(0, 1000)}...`,
        metadata: {
          sources: [...new Set(results.map(r => r.sourceName))],
          debug: { retrievalTime, totalTime: Date.now() - startTime }
        }
      });
    }
  } catch (error) {
    console.error("CHAT ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
