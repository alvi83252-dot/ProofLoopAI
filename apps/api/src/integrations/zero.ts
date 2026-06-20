export type ZeroSyncStatus = 'not_configured' | 'synced' | 'failed';

export interface ZeroSyncResult {
  synced: boolean;
  status: ZeroSyncStatus;
  zeroId?: string;
  zeroUrl?: string;
  error?: string;
  lastSyncedAt: string;
  mode: 'rest';
}

export interface ZeroSyncInput {
  type: string;
  workspaceId?: string;
  entityId?: string;
  title?: string;
  body?: string;
  entity?: Record<string, unknown>;
  crmEntry?: Record<string, unknown>;
  source?: Record<string, unknown>;
  signals?: Record<string, unknown>[];
}

export interface ZeroRecordPayload {
  externalId: string;
  type: string;
  title: string;
  body: string;
  source: {
    app: 'ProofLoop';
    workspaceId: string;
  };
  metadata: Record<string, unknown>;
}

const DEFAULT_WORKSPACE_ID = 'demo-workspace-001';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function getString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function getNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function summarizeErrorBody(value: string) {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact) return '';
  if (/<!doctype html|<html/i.test(compact)) {
    const title = compact.match(/<title>(.*?)<\/title>/i)?.[1];
    return title ? `HTML response: ${title}` : 'HTML response instead of Zero API JSON';
  }
  return compact.slice(0, 300);
}

function buildExternalId(input: ZeroSyncInput) {
  const workspaceId = input.workspaceId ?? DEFAULT_WORKSPACE_ID;
  const entityId =
    input.entityId ||
    getString(input.entity?.id) ||
    getString(input.crmEntry?.entityId) ||
    getString(input.crmEntry?.id) ||
    getString(input.source?.id, 'unknown');

  return `proofloop:${workspaceId}:${input.type}:${entityId}`;
}

export function buildZeroRecordPayload(input: ZeroSyncInput): ZeroRecordPayload {
  const entity = input.entity ?? {};
  const crmEntry = input.crmEntry ?? {};
  const source = input.source ?? {};
  const workspaceId =
    input.workspaceId ||
    getString(entity.workspaceId) ||
    getString(source.workspaceId) ||
    DEFAULT_WORKSPACE_ID;

  const quote = getString(entity.quote);
  const content = getString(entity.content) || getString(source.content);
  const title =
    input.title ||
    getString(crmEntry.title) ||
    getString(entity.title) ||
    getString(source.title) ||
    `${input.type.replace(/_/g, ' ')} from ProofLoop`;

  const proofScore = getNumber(entity.proofScore);
  const body = input.body ?? (quote || content.slice(0, 1200) || `${title} synced from ProofLoop.`);

  return {
    externalId: buildExternalId({ ...input, workspaceId }),
    type: input.type,
    title,
    body,
    source: {
      app: 'ProofLoop',
      workspaceId
    },
    metadata: {
      proofScore,
      category: entity.category,
      signalType: entity.signalType,
      recommendedUses: entity.recommendedUses,
      crmStatus: crmEntry.status,
      conversionOutcome: crmEntry.conversionOutcome,
      proofLoopEntity: entity,
      proofLoopCrmEntry: crmEntry,
      relatedSignals: input.signals
    }
  };
}

export async function syncToZero(input: ZeroSyncInput): Promise<ZeroSyncResult> {
  const lastSyncedAt = new Date().toISOString();

  if (!process.env.ZERO_API_KEY || !process.env.ZERO_API_URL) {
    return {
      synced: false,
      status: 'not_configured',
      error: 'Add ZERO_API_KEY and ZERO_API_URL to enable Zero sync.',
      lastSyncedAt,
      mode: 'rest'
    };
  }

  const baseUrl = trimTrailingSlash(process.env.ZERO_API_URL);
  const endpoint = process.env.ZERO_API_RECORDS_PATH ?? '/proofloop/records';
  const payload = buildZeroRecordPayload(input);

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ZERO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => res.statusText);
      const summary = summarizeErrorBody(errorBody);
      return {
        synced: false,
        status: 'failed',
        error: `Zero sync failed with ${res.status}${summary ? `: ${summary}` : `: ${res.statusText}`}`,
        lastSyncedAt,
        mode: 'rest'
      };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string; url?: string };
    return {
      synced: true,
      status: 'synced',
      zeroId: data.id,
      zeroUrl: data.url,
      lastSyncedAt,
      mode: 'rest'
    };
  } catch (error) {
    return {
      synced: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown Zero sync error',
      lastSyncedAt,
      mode: 'rest'
    };
  }
}
