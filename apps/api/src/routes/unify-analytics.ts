import { Hono } from 'hono';
import {
  getUnifyAnalyticsEvents,
  getUnifyAnalyticsStatus,
  identifyVisitor,
  trackEvent
} from '../integrations/unify-analytics.js';

const unifyAnalytics = new Hono();

/** GET /api/unify/analytics/status */
unifyAnalytics.get('/status', (c) => c.json(getUnifyAnalyticsStatus()));

/** GET /api/unify/analytics/events — local feed of events sent to Unify */
unifyAnalytics.get('/events', (c) => c.json(getUnifyAnalyticsEvents()));

/** POST /api/unify/analytics/track — send a custom intent event */
unifyAnalytics.post('/track', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    name?: string;
    properties?: Record<string, unknown>;
    visitorId?: string;
  };
  if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400);
  const entry = await trackEvent(body.name.trim(), body.properties ?? {}, body.visitorId);
  return c.json(entry);
});

/** POST /api/unify/analytics/identify — associate a visitor with identity traits */
unifyAnalytics.post('/identify', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    visitorId?: string;
    traits?: Record<string, unknown>;
  };
  if (!body.visitorId?.trim()) return c.json({ error: 'visitorId is required' }, 400);
  const entry = await identifyVisitor(body.visitorId.trim(), body.traits ?? {});
  return c.json(entry);
});

export default unifyAnalytics;
