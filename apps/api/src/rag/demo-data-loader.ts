import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chunkText } from './chunker.js';
import { upsertDocument, type RagDocument } from './vector-store.js';
import type { ExtractedSignal } from '../data/demo.js';

export interface DemoSource {
  id: string;
  type: string;
  title: string;
  content: string;
  fileName: string;
}

export interface DemoGuidanceExample {
  id: string;
  title: string;
  sourceId?: string;
  inputSnippet: string;
  expectedOutputs: Array<{
    quote: string;
    category: string;
    signalType: string;
    strength?: number;
    proofScore?: number;
    recommendedUses: string[];
  }>;
}

interface Manifest {
  sources: Array<{ id: string; file: string; type: string; title: string }>;
  guidance: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getDemoDataDir(): string {
  return resolve(__dirname, '../../../../demo-data');
}

function readManifest(): Manifest | null {
  const manifestPath = join(getDemoDataDir(), 'manifest.json');
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, 'utf-8')) as Manifest;
}

export function loadDemoSources(): DemoSource[] {
  const manifest = readManifest();
  if (!manifest) return [];

  const dir = getDemoDataDir();
  return manifest.sources
    .map((entry) => {
      const filePath = join(dir, entry.file);
      if (!existsSync(filePath)) return null;
      return {
        id: entry.id,
        type: entry.type,
        title: entry.title,
        content: readFileSync(filePath, 'utf-8').trim(),
        fileName: entry.file.split('/').pop() ?? entry.file
      };
    })
    .filter((s): s is DemoSource => s !== null && s.content.length > 0);
}

export function loadDemoGuidance(): DemoGuidanceExample[] {
  const manifest = readManifest();
  if (!manifest) return [];

  const guidancePath = join(getDemoDataDir(), manifest.guidance);
  if (!existsSync(guidancePath)) return [];

  const data = JSON.parse(readFileSync(guidancePath, 'utf-8')) as { examples: DemoGuidanceExample[] };
  return data.examples ?? [];
}

export function getDemoSourceById(id: string): DemoSource | undefined {
  return loadDemoSources().find((s) => s.id === id);
}

/** Index all demo-data sources into RAG */
export async function indexDemoSources(): Promise<number> {
  const sources = loadDemoSources();
  let total = 0;

  for (const source of sources) {
    const doc: RagDocument = {
      id: `demo-source-${source.id}`,
      source: 'demo-data',
      title: source.title,
      text: source.content,
      metadata: { type: source.type, fileName: source.fileName, demoSourceId: source.id }
    };
    total += await upsertDocument(doc, chunkText(`[${source.title}]\n${source.content}`));
  }

  return total;
}

/** Index guidance examples into RAG for output shaping */
export async function indexDemoGuidance(): Promise<number> {
  const examples = loadDemoGuidance();
  let total = 0;

  for (const ex of examples) {
    const outputs = ex.expectedOutputs
      .map(
        (o, i) =>
          `Example ${i + 1}: When input contains "${ex.inputSnippet}" → Quote: "${o.quote}" | Category: ${o.category} | Signal: ${o.signalType} | Score: ${o.proofScore ?? 85} | Uses: ${o.recommendedUses.join(', ')}`
      )
      .join('\n');

    const doc: RagDocument = {
      id: `demo-guidance-${ex.id}`,
      source: 'demo-guidance',
      title: ex.title,
      text: `GUIDANCE INPUT SNIPPET: ${ex.inputSnippet}\n\nEXPECTED OUTPUTS:\n${outputs}`,
      metadata: { guidanceId: ex.id, expectedOutputs: ex.expectedOutputs, sourceId: ex.sourceId }
    };
    total += await upsertDocument(doc, chunkText(doc.text));
  }

  return total;
}

export function findMatchingGuidance(content: string): DemoGuidanceExample | null {
  const normalized = content.toLowerCase();
  let best: DemoGuidanceExample | null = null;
  let bestScore = 0;

  for (const ex of loadDemoGuidance()) {
    const snippet = ex.inputSnippet.toLowerCase();
    if (normalized.includes(snippet)) {
      return ex;
    }

    const tokens = snippet.match(/[a-z0-9']+/g)?.filter((t) => t.length > 3) ?? [];
    const contentTokens = new Set(normalized.match(/[a-z0-9']+/g) ?? []);
    const overlap = tokens.filter((t) => contentTokens.has(t)).length;
    const score = overlap / Math.max(tokens.length, 1);
    if (score > bestScore && score > 0.35) {
      bestScore = score;
      best = ex;
    }
  }

  return best;
}

export function applyDemoGuidance(signals: ExtractedSignal[], content: string): ExtractedSignal[] {
  const match = findMatchingGuidance(content);
  if (!match) return signals;

  const guided = match.expectedOutputs.map((expected) => {
    const existing = signals.find(
      (s) => s.category === expected.category || s.signalType === expected.signalType
    );

    if (existing) {
      return {
        ...existing,
        quote: existing.quote.length >= expected.quote.length ? existing.quote : expected.quote,
        category: expected.category,
        signalType: expected.signalType,
        strength: expected.strength ?? existing.strength,
        proofScore: expected.proofScore ?? existing.proofScore,
        recommendedUses: [...new Set([...expected.recommendedUses, ...existing.recommendedUses])]
      };
    }

    return {
      quote: expected.quote,
      category: expected.category,
      signalType: expected.signalType,
      strength: expected.strength ?? 85,
      proofScore: expected.proofScore ?? 83,
      credibility: 0.88,
      specificity: 0.9,
      revenueImpact: expected.category === 'Financial Impact' ? 0.9 : 0.65,
      emotionalImpact: expected.category === 'Emotional Impact' ? 0.92 : 0.6,
      conversionPotential: 0.85,
      recommendedUses: expected.recommendedUses
    } satisfies ExtractedSignal;
  });

  const merged = [...guided];
  for (const s of signals) {
    if (!merged.some((m) => m.quote === s.quote)) merged.push(s);
  }
  return merged;
}

export function getDemoDataSummary() {
  return {
    dir: getDemoDataDir(),
    sources: loadDemoSources().map((s) => ({ id: s.id, title: s.title, type: s.type, fileName: s.fileName })),
    guidanceExamples: loadDemoGuidance().length
  };
}
