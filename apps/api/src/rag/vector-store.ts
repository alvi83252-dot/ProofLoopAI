import { embedText } from '../ai/pipeline.js';

export interface RagChunk {
  id: string;
  documentId: string;
  source: string;
  title: string;
  text: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export interface RagDocument {
  id: string;
  source: string;
  title: string;
  text: string;
  metadata: Record<string, unknown>;
}

const store = new Map<string, RagChunk>();

export function getChunkCount(): number {
  return store.size;
}

export function getDocumentCount(): number {
  return new Set([...store.values()].map((c) => c.documentId)).size;
}

export function clearStore(): void {
  store.clear();
}

export function getAllChunks(): RagChunk[] {
  return [...store.values()];
}

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

/** Fallback embedding using hashed bag-of-words (384 dims) when Voyage unavailable */
export function hashEmbed(text: string, dims = 384): number[] {
  const vec = new Array(dims).fill(0);
  const tokens = tokenize(text);
  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    vec[hash % dims] += 1;
    vec[(hash * 7) % dims] += 0.5;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export async function buildEmbedding(text: string): Promise<number[]> {
  const voyage = await embedText(text);
  return voyage ?? hashEmbed(text);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export async function upsertDocument(doc: RagDocument, chunks: { text: string; index: number }[]): Promise<number> {
  for (const chunk of chunks) {
    const id = `${doc.id}::${chunk.index}`;
    const embedding = await buildEmbedding(chunk.text);
    store.set(id, {
      id,
      documentId: doc.id,
      source: doc.source,
      title: doc.title,
      text: chunk.text,
      embedding,
      metadata: { ...doc.metadata, chunkIndex: chunk.index }
    });
  }
  return chunks.length;
}

export async function search(query: string, topK = 5): Promise<Array<RagChunk & { score: number }>> {
  if (store.size === 0) return [];
  const queryEmbedding = await buildEmbedding(query);
  const results = [...store.values()]
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  return results;
}

/** Keyword boost for hybrid retrieval */
export async function hybridSearch(query: string, topK = 5): Promise<Array<RagChunk & { score: number }>> {
  const semantic = await search(query, topK * 2);
  const queryTokens = new Set(tokenize(query));

  const boosted = semantic.map((chunk) => {
    const chunkTokens = tokenize(chunk.text);
    const overlap = chunkTokens.filter((t) => queryTokens.has(t)).length;
    const keywordBoost = Math.min(overlap * 0.05, 0.25);
    return { ...chunk, score: chunk.score + keywordBoost };
  });

  return boosted.sort((a, b) => b.score - a.score).slice(0, topK);
}
