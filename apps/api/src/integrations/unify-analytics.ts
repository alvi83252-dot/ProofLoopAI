import { v4 as uuidv4 } from 'uuid';

/**
 * Unify GTM — Analytics API client (intent event ingestion).
 *
 * Base:   https://api.unifyintent.com/analytics/v1   (override via UNIFY_ANALYTICS_URL)
 * Auth:   X-Write-Key: <write key>  + an allowed Origin header
 * Events: POST /page, POST /track, POST /identify
 *
 * SAFETY: this client ONLY uses UNIFY_WRITE_KEY — never the secret UNIFY_API_KEY.
 * Per Unify's docs, sending a secret Data API key to the Analytics endpoint causes
 * Unify to immediately expire that key. The write key is a different credential
 * (Unify → Settings → Web & product data) and is safe to expose.
 *
 * Without a write key, the client runs in "simulated" mode: events are logged
 * in-memory (and visible in the UI) but not sent to Unify — so the demo works
 * offline and goes live the moment UNIFY_WRITE_KEY is set.
 */

const ANALYTICS_BASE = (process.env.UNIFY_ANALYTICS_URL ?? 'https://api.unifyintent.com/analytics/v1').replace(/\/$/, '');

export type UnifyAnalyticsEventType = 'page' | 'track' | 'identify';

export interface UnifyAnalyticsLogEntry {
  id: string;
  type: UnifyAnalyticsEventType;
  name?: string;
  visitorId: string;
  payload: Record<string, unknown>;
  mode: 'live' | 'simulated';
  ok: boolean;
  status?: number;
  error?: string;
  sentAt: string;
}

const analyticsLog: UnifyAnalyticsLogEntry[] = [];
const MAX_LOG = 100;

export function getUnifyWriteKey(): string | undefined {
  return process.env.UNIFY_WRITE_KEY?.trim() || undefined;
}

export function isUnifyAnalyticsLive(): boolean {
  return Boolean(getUnifyWriteKey());
}

function getOrigin(): string {
  return (process.env.UNIFY_ANALYTICS_ORIGIN ?? process.env.PUBLIC_APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');
}

function baseContext(extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    library: { name: 'corroba-server', version: '1.0.0' },
    source: 'corroba',
    ...extra
  };
}

function record(entry: Omit<UnifyAnalyticsLogEntry, 'id' | 'sentAt'>): UnifyAnalyticsLogEntry {
  const full: UnifyAnalyticsLogEntry = { id: uuidv4(), sentAt: new Date().toISOString(), ...entry };
  analyticsLog.unshift(full);
  if (analyticsLog.length > MAX_LOG) analyticsLog.length = MAX_LOG;
  return full;
}

async function send(
  type: UnifyAnalyticsEventType,
  body: Record<string, unknown>,
  name?: string
): Promise<UnifyAnalyticsLogEntry> {
  const writeKey = getUnifyWriteKey();
  const visitorId = String(body.visitorId ?? 'corroba-server');

  if (!writeKey) {
    // Simulated: no write key → log locally, do not call the API.
    return record({ type, name, visitorId, payload: body, mode: 'simulated', ok: true });
  }

  try {
    const res = await fetch(`${ANALYTICS_BASE}/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Write-Key': writeKey,
        Origin: getOrigin()
      },
      body: JSON.stringify(body)
    });
    return record({
      type,
      name,
      visitorId,
      payload: body,
      mode: 'live',
      ok: res.ok,
      status: res.status,
      error: res.ok ? undefined : `HTTP ${res.status}`
    });
  } catch (err) {
    return record({
      type,
      name,
      visitorId,
      payload: body,
      mode: 'live',
      ok: false,
      error: err instanceof Error ? err.message : 'send failed'
    });
  }
}

/** Custom (track) event — the building block for Corroba → Unify intent signals. */
export function trackEvent(
  name: string,
  properties: Record<string, unknown> = {},
  visitorId = 'corroba-server'
): Promise<UnifyAnalyticsLogEntry> {
  return send(
    'track',
    {
      type: 'track',
      name,
      visitorId,
      timestamp: new Date().toISOString(),
      context: baseContext(),
      properties
    },
    name
  );
}

/** Identify event — associate a visitor with identity info (e.g. email/domain). */
export function identifyVisitor(visitorId: string, traits: Record<string, unknown> = {}): Promise<UnifyAnalyticsLogEntry> {
  return send('identify', {
    type: 'identify',
    visitorId,
    timestamp: new Date().toISOString(),
    context: baseContext(),
    traits
  });
}

/** Page event. */
export function pageEvent(visitorId: string, properties: Record<string, unknown> = {}): Promise<UnifyAnalyticsLogEntry> {
  return send('page', {
    type: 'page',
    visitorId,
    timestamp: new Date().toISOString(),
    context: baseContext(properties)
  });
}

/** Fire-and-forget custom event — never let analytics break a request. */
export function emitProofEvent(name: string, properties: Record<string, unknown> = {}, visitorId?: string): void {
  void trackEvent(name, properties, visitorId).catch(() => {});
}

export function getUnifyAnalyticsEvents(): UnifyAnalyticsLogEntry[] {
  return [...analyticsLog];
}

export function resetUnifyAnalytics(): void {
  analyticsLog.length = 0;
}

export function getUnifyAnalyticsStatus() {
  return {
    service: 'unify-analytics',
    mode: isUnifyAnalyticsLive() ? 'live' : 'simulated',
    provider: 'Unify GTM Analytics API',
    baseUrl: ANALYTICS_BASE,
    origin: getOrigin(),
    writeKeyConfigured: isUnifyAnalyticsLive(),
    eventsLogged: analyticsLog.length,
    eventTypes: ['page', 'track', 'identify'],
    endpoints: {
      track: 'POST /api/unify/analytics/track',
      identify: 'POST /api/unify/analytics/identify',
      events: 'GET /api/unify/analytics/events',
      status: 'GET /api/unify/analytics/status'
    }
  };
}
