import { GoogleGenerativeAI } from "@google/generative-ai";
import { addUploadedDoc, addDocumentChunks } from "@/lib/vector-store";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = "";

    // 1. Stable Text Extraction
    console.log(`[UPLOAD] Processing file: ${file.name}, Type: ${file.type}`);
    
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        console.log("[UPLOAD] Parsing PDF...");
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        await parser.destroy();
        text = data.text;
        console.log(`[UPLOAD] PDF parsing successful. Extracted ${text.length} characters.`);
      } catch (pdfError) {
        const errorMsg = pdfError instanceof Error ? pdfError.message : String(pdfError);
        throw new Error("Failed to parse PDF: " + errorMsg);
      }
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text" }, { status: 400 });
    }

    // 2. Simple character-based text splitter (~1000 chars)
    const chunkSize = 1000;
    const finalChunks = text.match(new RegExp(`.{1,${chunkSize}}`, 'gs')) || [];

    const docId = crypto.randomUUID();
    
    // 3. Store chunks in memory (global variable handled in vector-store.ts)
    await addDocumentChunks(docId, (file as File).name, finalChunks);

    // Register document in store
    addUploadedDoc({
      id: docId,
      name: (file as File).name,
      type: (file as File).type,
      chunkCount: finalChunks.length,
      uploadedAt: new Date().toISOString(),
    });

    // 4. Gemini Summary (Optional)
    let summary = "Summary generation skipped";
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const summaryText = text.length > 5000 ? text.slice(0, 5000) + "..." : text;
      const result = await model.generateContent(`Summarize this document in 2-3 sentences:\n\n${summaryText}`);
      summary = result.response.text().trim();
    } catch (summaryError) {
      console.warn("[UPLOAD] Gemini summary failed, but document was indexed:", summaryError);
    }

    return NextResponse.json({
        success: true,
        text: text.slice(0, 500),
        fileName: (file as File).name,
        summary: summary,
    });

  } catch (error) {
    console.error("[UPLOAD ERROR]:", error);
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
