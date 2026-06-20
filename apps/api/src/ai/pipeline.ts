import type { ExtractedSignal } from '../data/demo.js';

const FINANCIAL_PATTERNS = [
  /saved?\s*[£$€]?\s*[\d,]+/i,
  /[\d,]+\s*(hours?|hrs?)\s*(per|\/)\s*week/i,
  /(\d+)%\s*(increase|improvement|lift|jump|reduction|faster)/i,
  /[\£$€][\d,]+(?:\.\d+)?\s*(million|m|k|thousand)?/i
];

const EMOTIONAL_PATTERNS = [
  /love|amazing|incredible|game.?changer|burnout|struggled|seamless|finally/i
];

function scoreSpecificity(text: string): number {
  const hasNumber = /\d/.test(text);
  const hasCurrency = /[£$€]/.test(text);
  const hasPercent = /%/.test(text);
  const wordCount = text.split(/\s+/).length;
  let score = 0.5;
  if (hasNumber) score += 0.15;
  if (hasCurrency) score += 0.15;
  if (hasPercent) score += 0.1;
  if (wordCount > 15) score += 0.1;
  return Math.min(score, 1);
}

function detectCategory(text: string): { category: string; signalType: string } {
  if (/saved?\s*[£$€]|cost|revenue|roi|£[\d,]+|\$[\d,]+/i.test(text)) {
    return { category: 'Financial Impact', signalType: 'Revenue Savings' };
  }
  if (/hours?\s*(per|\/)\s*week|time\s*sav/i.test(text)) {
    return { category: 'Efficiency', signalType: 'Time Savings' };
  }
  if (/conversion|growth|adoption|deals?|sales\s*cycle/i.test(text)) {
    return { category: 'Growth', signalType: 'Growth Improvement' };
  }
  if (/burnout|emotional|love|satisfaction|trust/i.test(text)) {
    return { category: 'Emotional Impact', signalType: 'Customer Satisfaction' };
  }
  if (/risk|competitor|switch|before/i.test(text)) {
    return { category: 'Sales Enablement', signalType: 'Risk Reduction' };
  }
  return { category: 'Product Value', signalType: 'Differentiator' };
}

function extractQuotes(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && !/^Subject:/i.test(s) && !/^score,comment/i.test(s));

  const quoted = text.match(/"([^"]{20,})"/g)?.map((q) => q.replace(/"/g, '')) ?? [];
  const candidates = [...new Set([...quoted, ...sentences])];
  return candidates.filter((s) => FINANCIAL_PATTERNS.some((p) => p.test(s)) || EMOTIONAL_PATTERNS.some((p) => p.test(s))).slice(0, 8);
}

function computeProofScore(specificity: number, credibility: number, revenue: number, emotional: number, conversion: number): number {
  return Math.round((specificity * 0.25 + credibility * 0.2 + revenue * 0.25 + emotional * 0.15 + conversion * 0.15) * 100);
}

function recommendedUses(category: string, signalType: string): string[] {
  const uses = ['Case Study'];
  if (category === 'Financial Impact') uses.unshift('Landing Page Hero', 'Sales Deck');
  if (signalType === 'Time Savings') uses.push('LinkedIn Post', 'Email Campaign');
  if (category === 'Emotional Impact') uses.push('Founder Content', 'Brand Story');
  if (category === 'Growth') uses.push('GTM Playbook');
  return [...new Set(uses)];
}

/** LangGraph-style multi-step proof discovery pipeline (RAG context optional) */
export async function runProofDiscoveryPipeline(content: string, ragContext?: string): Promise<ExtractedSignal[]> {
  if (process.env.OPENAI_API_KEY && ragContext) {
    try {
      return await extractWithOpenAI(content, ragContext);
    } catch {
      /* fall through to rule-based */
    }
  }

  const quotes = extractQuotes(content);
  if (quotes.length === 0) {
    const trimmed = content.trim().slice(0, 200);
    if (trimmed.length > 20) quotes.push(trimmed);
  }

  return quotes.map((quote) => {
    const { category, signalType } = detectCategory(quote);
    const specificity = scoreSpecificity(quote);
    const credibility = Math.min(0.7 + specificity * 0.3, 0.98);
    const revenueImpact = category === 'Financial Impact' ? 0.85 + specificity * 0.1 : 0.5 + specificity * 0.3;
    const emotionalImpact = EMOTIONAL_PATTERNS.some((p) => p.test(quote)) ? 0.8 + specificity * 0.15 : 0.4 + specificity * 0.2;
    const conversionPotential = (specificity + revenueImpact + emotionalImpact) / 3;
    const proofScore = computeProofScore(specificity, credibility, revenueImpact, emotionalImpact, conversionPotential);

    return {
      quote,
      category,
      signalType,
      strength: proofScore,
      proofScore,
      credibility,
      specificity,
      revenueImpact,
      emotionalImpact,
      conversionPotential,
      recommendedUses: recommendedUses(category, signalType)
    };
  });
}

async function extractWithOpenAI(content: string, ragContext: string): Promise<ExtractedSignal[]> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You extract customer proof trust signals from text. Use the RAG context (demo-data guidance + similar documents) to guide category and recommendedUses. Return JSON array only: [{ "quote", "category", "signalType", "recommendedUses": [] }]`
        },
        {
          role: 'user',
          content: `RAG CONTEXT:\n${ragContext.slice(0, 3000)}\n\nCUSTOMER DATA:\n${content.slice(0, 4000)}\n\nExtract all trust signals with proof quotes.`
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) throw new Error('OpenAI extraction failed');
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const parsed = JSON.parse(data.choices[0]?.message?.content ?? '{}') as {
    signals?: Partial<ExtractedSignal>[];
    trust_signals?: Partial<ExtractedSignal>[];
  };
  const raw = parsed.signals ?? parsed.trust_signals ?? (Array.isArray(parsed) ? parsed : []);

  return (raw as Partial<ExtractedSignal>[]).map((s) => {
    const quote = s.quote ?? '';
    const { category, signalType } = s.category ? { category: s.category, signalType: s.signalType ?? 'Differentiator' } : detectCategory(quote);
    const specificity = scoreSpecificity(quote);
    const credibility = Math.min(0.75 + specificity * 0.25, 0.98);
    const revenueImpact = category === 'Financial Impact' ? 0.88 : 0.6;
    const emotionalImpact = category === 'Emotional Impact' ? 0.9 : 0.55;
    const conversionPotential = (specificity + revenueImpact + emotionalImpact) / 3;
    const proofScore = computeProofScore(specificity, credibility, revenueImpact, emotionalImpact, conversionPotential);

    return {
      quote,
      category,
      signalType,
      strength: s.strength ?? proofScore,
      proofScore: s.proofScore ?? proofScore,
      credibility: s.credibility ?? credibility,
      specificity: s.specificity ?? specificity,
      revenueImpact: s.revenueImpact ?? revenueImpact,
      emotionalImpact: s.emotionalImpact ?? emotionalImpact,
      conversionPotential: s.conversionPotential ?? conversionPotential,
      recommendedUses: s.recommendedUses ?? recommendedUses(category, signalType)
    };
  }).filter((s) => s.quote.length > 10);
}

/** DSPy-style proof scoring refinement (Lightfern integration point) */
export async function scoreProofSignal(signal: ExtractedSignal): Promise<ExtractedSignal> {
  if (process.env.LIGHTFERN_API_KEY && process.env.LIGHTFERN_API_URL) {
    // Integration point — call Lightfern API when key provided
  }
  return signal;
}

/** Voyage AI embedding integration point */
export async function embedText(text: string): Promise<number[] | null> {
  if (!process.env.VOYAGE_API_KEY) return null;
  try {
    const res = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input: text, model: 'voyage-3' })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data: { embedding: number[] }[] };
    return data.data[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

import { parseFileContent, validateUploadFile, FileParseError } from '../ai/file-parser.js';
