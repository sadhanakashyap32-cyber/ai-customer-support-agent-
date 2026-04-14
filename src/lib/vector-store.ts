import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  chunkCount: number;
  uploadedAt: string;
}

export interface ChunkEntry {
  docId: string;
  sourceName: string;
  text: string;
  embedding?: number[];
}

interface DocStoreState {
  chunks: ChunkEntry[];
  docs: UploadedDocument[];
}

declare global {
  var __docStoreState: DocStoreState | undefined;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "knowledge-base.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function saveState() {
  ensureDataDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(global.__docStoreState, null, 2));
}

function loadState() {
  if (fs.existsSync(STORE_PATH)) {
    try {
      const data = fs.readFileSync(STORE_PATH, "utf8");
      const loaded = JSON.parse(data);
      global.__docStoreState = {
        chunks: loaded.chunks || loaded.vectors || [], // Support migration
        docs: loaded.docs || [],
      };
    } catch (e) {
      console.error("Failed to load doc store from file", e);
      global.__docStoreState = { chunks: [], docs: [] };
    }
  } else {
    global.__docStoreState = { chunks: [], docs: [] };
  }
}


if (!global.__docStoreState) {
  loadState();
}

/**
 * Adds document chunks to the store.
 */
/**
 * Adds document chunks to the store with semantic embeddings.
 */
export async function addDocumentChunks(docId: string, sourceName: string, chunks: string[]) {
  if (!global.__docStoreState) {
    console.log("[VECTOR STORE] State not initialized, loading...");
    loadState();
  }
  
  if (!global.__docStoreState?.chunks) {
    console.error("[VECTOR STORE ERROR] Chunks array is missing after load attempt.");
    global.__docStoreState = { chunks: [], docs: global.__docStoreState?.docs || [] };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  console.log(`[VECTOR STORE] Generating embeddings for ${chunks.length} chunks...`);

  const entries: ChunkEntry[] = await Promise.all(
    chunks.map(async (text) => {
      let embedding: number[] | undefined;
      try {
        const result = await embeddingModel.embedContent(text);
        embedding = result.embedding.values;
      } catch (e) {
        console.warn(`[VECTOR STORE] Failed to embed chunk, skipping semantic search for it:`, e);
      }
      return {
        docId,
        sourceName,
        text,
        embedding,
      };
    })
  );

  global.__docStoreState.chunks.push(...entries);
  saveState();
  console.log(`Successfully indexed ${chunks.length} chunks with embeddings for ${sourceName}.`);
}


/**
 * Retrieves the first few chunks for context.
 */
export function getChunksForContext(limit = 10): string {
  const chunks = global.__docStoreState!.chunks;
  // Get the most recently added chunks or just the first few
  // Requirement says "use only first few chunks as context"
  return chunks.slice(0, limit).map(c => `[Source: ${c.sourceName}]\n${c.text}`).join("\n\n---\n\n");
}

export function getUploadedDocs(): UploadedDocument[] {
  return global.__docStoreState!.docs;
}

export function addUploadedDoc(doc: UploadedDocument) {
  global.__docStoreState!.docs.push(doc);
  saveState();
}

export function deleteUploadedDoc(id: string) {
  const state = global.__docStoreState!;
  state.docs = state.docs.filter((d) => d.id !== id);
  state.chunks = state.chunks.filter((c) => c.docId !== id);
  saveState();
}

// Compatibility exports to avoid breaking other files immediately
export const addVectors = addDocumentChunks;
/**
 * Cosine similarity utility.
 */
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Hybrid search: Combines keyword matching and semantic similarity.
 */
export async function hybridSearch(query: string, limit = 5, queryEmbedding?: number[]) {
  const startTime = Date.now();
  const chunks = global.__docStoreState!.chunks;
  
  if (!query || chunks.length === 0) {
    return {
      results: [],
      retrievalTime: Date.now() - startTime
    };
  }

  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  
  const scored = chunks.map(chunk => {
    let keywordScore = 0;
    const text = chunk.text.toLowerCase();
    
    // Keyword scoring
    queryTerms.forEach(term => {
      const matches = text.split(term).length - 1;
      keywordScore += matches;
    });

    // Semantic scoring
    let semanticScore = 0;
    if (queryEmbedding && chunk.embedding) {
      semanticScore = cosineSimilarity(queryEmbedding, chunk.embedding);
    }
    
    // Combined score: weighting keyword and semantic
    const finalScore = (keywordScore * 0.3) + (semanticScore * 0.7);
    
    return { ...chunk, score: finalScore, semanticScore, keywordScore };
  })
  .filter(c => c.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit);

  return {
    results: scored,
    retrievalTime: Date.now() - startTime
  };
}
