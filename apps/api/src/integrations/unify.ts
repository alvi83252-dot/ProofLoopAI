/**
 * Unify — Conversations API client
 * Base URL: https://chat.eu.api.mitel.io/2017-09-01
 * Endpoint: GET /conversations
 * Auth: Authorization: Bearer <token>
 */

export interface UnifyConversation {
  id: string;
  title: string;
  text: string;
  metadata: Record<string, unknown>;
}

export interface UnifyConversationsResponse {
  conversations: UnifyConversation[];
  source: 'unify' | 'demo';
  total: number;
}

const DEFAULT_UNIFY_BASE = 'https://chat.eu.api.mitel.io/2017-09-01';

export function getUnifyBaseUrl(): string {
  const url = process.env.UNIFY_API_URL?.trim();
  return url || DEFAULT_UNIFY_BASE;
}

export function isUnifyConfigured(): boolean {
  return Boolean(process.env.UNIFY_API_KEY);
}

/** Demo conversations mirroring real customer proof in chat/support contexts */
export const DEMO_UNIFY_CONVERSATIONS: UnifyConversation[] = [
  {
    id: 'conv-recruitment-001',
    title: 'TalentFlow — Recruitment Agency',
    text: `Customer: We're a recruitment agency with 120 staff. Our recruiters were spending 12+ hours per week on manual CV screening.
Support: Have you tried automating shortlist generation?
Customer: After onboarding, we saved £40,000 in operational costs within 3 months. Screening time dropped dramatically.
Customer: This proof point is exactly what our enterprise prospects ask for — quantified ROI and time savings.`,
    metadata: { industry: 'Staffing & Recruiting', companySize: '50-500', channel: 'support' }
  },
  {
    id: 'conv-staffing-002',
    title: 'StaffingCo — Enterprise Staffing',
    text: `Customer: We run high-volume hiring for enterprise clients. Before switching, sales cycles were 90+ days.
Customer: One case study about reducing sales cycle by 40% would help our SDR team massively.
Customer: Our VP Operations said team adoption hit 95% in week one — that's rare for HR tech.`,
    metadata: { industry: 'Human Resources', companySize: '200-2000', channel: 'success' }
  },
  {
    id: 'conv-talent-003',
    title: 'HireBridge — Talent Platform',
    text: `Customer: We're a talent platform connecting employers with candidates at scale.
Customer: The emotional moment for us was a customer quote about saving their team from burnout.
Customer: We need proof-led messaging for LinkedIn — financial impact converts CFOs, emotional proof converts champions.`,
    metadata: { industry: 'HR Tech', companySize: '20-200', channel: 'sales' }
  },
  {
    id: 'conv-saas-004',
    title: 'ScaleStack — B2B SaaS',
    text: `Customer: We're a growth-stage SaaS startup without a big marketing team.
Customer: ProofLoop surfaced 47 trust signals from 2 years of support tickets we never used.
Customer: Landing page conversion jumped 34% after updating hero with a single ROI quote from customer email.`,
    metadata: { industry: 'Software', companySize: '10-100', channel: 'support' }
  },
  {
    id: 'conv-cs-005',
    title: 'RevOps — Customer Success',
    text: `Customer: Our CS team sits on gold — NPS responses, renewal calls, QBR notes.
Customer: Time savings of 8 hours per rep per week showed up repeatedly in survey data.
Customer: Customer satisfaction scores up 28 points after we started leading with ranked proof in outreach.`,
    metadata: { industry: 'Cross-industry', companySize: '100-1000', channel: 'survey' }
  }
];

function extractTextFromRecord(record: unknown, depth = 0): string {
  if (depth > 6 || record == null) return '';
  if (typeof record === 'string') return record;
  if (typeof record === 'number' || typeof record === 'boolean') return String(record);

  if (Array.isArray(record)) {
    return record.map((item) => extractTextFromRecord(item, depth + 1)).filter(Boolean).join('\n');
  }

  if (typeof record === 'object') {
    const obj = record as Record<string, unknown>;
    const priorityKeys = ['body', 'content', 'text', 'message', 'messages', 'transcript', 'summary', 'subject', 'title', 'description'];
    const parts: string[] = [];

    for (const key of priorityKeys) {
      if (obj[key]) parts.push(extractTextFromRecord(obj[key], depth + 1));
    }

    if (parts.length === 0) {
      for (const value of Object.values(obj)) {
        if (typeof value === 'string' && value.length > 10) parts.push(value);
      }
    }

    return parts.filter(Boolean).join('\n');
  }

  return '';
}

function normalizeConversation(raw: Record<string, unknown>, index: number): UnifyConversation | null {
  const text = extractTextFromRecord(raw).trim();
  if (text.length < 20) return null;

  const id = String(raw.id ?? raw.conversationId ?? raw.uuid ?? `conv-${index}`);
  const title = String(raw.title ?? raw.subject ?? raw.name ?? raw.topic ?? `Conversation ${index + 1}`);

  const metadata: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      metadata[k] = v;
    }
  }

  return { id, title, text, metadata };
}

function parseConversationsPayload(payload: unknown): UnifyConversation[] {
  let items: unknown[] = [];

  if (Array.isArray(payload)) {
    items = payload;
  } else if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.conversations)) items = obj.conversations;
    else if (Array.isArray(obj.items)) items = obj.items;
    else if (Array.isArray(obj.data)) items = obj.data;
    else if (Array.isArray(obj.results)) items = obj.results;
  }

  return items
    .map((item, i) => (item && typeof item === 'object' ? normalizeConversation(item as Record<string, unknown>, i) : null))
    .filter((c): c is UnifyConversation => c !== null);
}

/** Fetch conversations from Unify / Mitel API */
export async function fetchUnifyConversations(): Promise<UnifyConversationsResponse> {
  if (!isUnifyConfigured()) {
    return { conversations: DEMO_UNIFY_CONVERSATIONS, source: 'demo', total: DEMO_UNIFY_CONVERSATIONS.length };
  }

  const baseUrl = getUnifyBaseUrl();
  const res = await fetch(`${baseUrl}/conversations`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.UNIFY_API_KEY}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Unify conversations API error (${res.status}): ${errText}`);
  }

  const payload = await res.json();
  const conversations = parseConversationsPayload(payload);

  if (conversations.length === 0) {
    return { conversations: DEMO_UNIFY_CONVERSATIONS, source: 'demo', total: DEMO_UNIFY_CONVERSATIONS.length };
  }

  return { conversations, source: 'unify', total: conversations.length };
}
