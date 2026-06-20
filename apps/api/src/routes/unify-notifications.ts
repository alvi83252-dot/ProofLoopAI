import { Hono } from 'hono';
import {
  getUnifyEvents,
  getUnifyNotificationsStatus,
  getUnifySubscriptions,
  receiveWebhookNotification,
  sendTestNotification,
  subscribeToNotifications,
  type SubscribeRequest,
  type TestNotificationRequest,
  type UnifyNotificationPayload
} from '../integrations/unify-notifications.js';

const unifyNotifications = new Hono();

function requireStringFields(body: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    const value = body[field];
    if (typeof value !== 'string' || !value.trim()) {
      return `${field} is required`;
    }
  }
  return null;
}

/** POST /api/unify/notifications/subscribe */
unifyNotifications.post('/subscribe', async (c) => {
  const body = await c.req.json<SubscribeRequest>();
  const error = requireStringFields(body as unknown as Record<string, unknown>, ['topic', 'subjectFilter', 'webhookUrl']);
  if (error) return c.json({ error }, 400);

  return c.json(subscribeToNotifications(body));
});

/** POST /api/unify/notifications/test — fan-out to all subscription webhooks */
unifyNotifications.post('/test', async (c) => {
  const body = await c.req.json<TestNotificationRequest>();
  const error = requireStringFields(body as unknown as Record<string, unknown>, ['event', 'conversationId', 'message']);
  if (error) return c.json({ error }, 400);

  const result = await sendTestNotification(body);
  return c.json(result);
});

/** POST /api/unify/notifications/webhook — internal demo receiver */
unifyNotifications.post('/webhook', async (c) => {
  const body = await c.req.json<UnifyNotificationPayload>();
  const error = requireStringFields(body as unknown as Record<string, unknown>, ['event', 'conversationId', 'message']);
  if (error) return c.json({ error }, 400);

  receiveWebhookNotification({
    event: body.event,
    conversationId: body.conversationId,
    message: body.message,
    timestamp: body.timestamp ?? new Date().toISOString()
  });

  return c.json({ received: true });
});

/** GET /api/unify/notifications/events — live notification feed for UI */
unifyNotifications.get('/events', (c) => c.json(getUnifyEvents()));

/** GET /api/unify/notifications/subscriptions — list active subscriptions (demo helper) */
unifyNotifications.get('/subscriptions', (c) => c.json(getUnifySubscriptions()));

/** GET /api/unify/notifications/status */
unifyNotifications.get('/status', (c) => c.json(getUnifyNotificationsStatus()));

export default unifyNotifications;
