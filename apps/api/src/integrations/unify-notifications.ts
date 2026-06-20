import { v4 as uuidv4 } from 'uuid';

/** Simulated Mitel CloudLink / Unify Notifications API — in-memory only */

export interface UnifySubscription {
  subscriptionId: string;
  topic: string;
  subjectFilter: string;
  webhookUrl: string;
  createdAt: string;
}

export interface UnifyNotificationPayload {
  event: string;
  conversationId: string;
  message: string;
  timestamp: string;
}

export interface UnifyEvent extends UnifyNotificationPayload {
  id: string;
  receivedAt: string;
}

export interface SubscribeRequest {
  topic: string;
  subjectFilter: string;
  webhookUrl: string;
}

export interface SubscribeResponse {
  status: 'subscribed';
  subscriptionId: string;
  topic: string;
  subjectFilter: string;
  webhookUrl: string;
}

export interface TestNotificationRequest {
  event: string;
  conversationId: string;
  message: string;
}

export interface TestNotificationResponse {
  status: 'sent';
  subscriptionsNotified: number;
  deliveryResults?: Array<{ subscriptionId: string; webhookUrl: string; ok: boolean; status?: number }>;
}

const subscriptions: UnifySubscription[] = [];
export const unifyEvents: UnifyEvent[] = [];

export function getUnifySubscriptions(): UnifySubscription[] {
  return [...subscriptions];
}

export function getUnifyEvents(): UnifyEvent[] {
  return [...unifyEvents];
}

export function resetUnifyNotifications(): void {
  subscriptions.length = 0;
  unifyEvents.length = 0;
}

/** Resolve relative webhook paths against the local API base (demo mode) */
export function resolveWebhookUrl(webhookUrl: string): string {
  const trimmed = webhookUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = (process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3001}`).replace(/\/$/, '');
  return `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export function subscribeToNotifications(body: SubscribeRequest): SubscribeResponse {
  const subscription: UnifySubscription = {
    subscriptionId: uuidv4(),
    topic: body.topic,
    subjectFilter: body.subjectFilter,
    webhookUrl: body.webhookUrl,
    createdAt: new Date().toISOString()
  };

  subscriptions.push(subscription);

  return {
    status: 'subscribed',
    subscriptionId: subscription.subscriptionId,
    topic: subscription.topic,
    subjectFilter: subscription.subjectFilter,
    webhookUrl: subscription.webhookUrl
  };
}

export function receiveWebhookNotification(payload: UnifyNotificationPayload): UnifyEvent {
  const event: UnifyEvent = {
    id: uuidv4(),
    ...payload,
    receivedAt: new Date().toISOString()
  };

  unifyEvents.unshift(event);
  console.log('[unify/notifications/webhook] received:', JSON.stringify(event, null, 2));

  return event;
}

/** Fan-out a test notification to every subscribed webhook (simulated Mitel push) */
export async function sendTestNotification(body: TestNotificationRequest): Promise<TestNotificationResponse> {
  const payload: UnifyNotificationPayload = {
    event: body.event,
    conversationId: body.conversationId,
    message: body.message,
    timestamp: new Date().toISOString()
  };

  if (subscriptions.length === 0) {
    return { status: 'sent', subscriptionsNotified: 0, deliveryResults: [] };
  }

  const deliveryResults: TestNotificationResponse['deliveryResults'] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      const targetUrl = resolveWebhookUrl(sub.webhookUrl);
      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Unify-Simulation': 'true' },
          body: JSON.stringify(payload)
        });
        deliveryResults!.push({
          subscriptionId: sub.subscriptionId,
          webhookUrl: sub.webhookUrl,
          ok: res.ok,
          status: res.status
        });
      } catch (err) {
        console.warn(`[unify/notifications/test] webhook delivery failed for ${sub.webhookUrl}:`, err);
        deliveryResults!.push({
          subscriptionId: sub.subscriptionId,
          webhookUrl: sub.webhookUrl,
          ok: false
        });
      }
    })
  );

  const okCount = deliveryResults!.filter((r) => r.ok).length;

  return {
    status: 'sent',
    subscriptionsNotified: okCount,
    deliveryResults
  };
}

export function getUnifyNotificationsStatus() {
  return {
    service: 'unify-notifications',
    mode: 'simulated',
    provider: 'Mitel CloudLink (simulated)',
    subscriptions: subscriptions.length,
    eventsReceived: unifyEvents.length,
    endpoints: {
      subscribe: 'POST /api/unify/notifications/subscribe',
      test: 'POST /api/unify/notifications/test',
      webhook: 'POST /api/unify/notifications/webhook',
      events: 'GET /api/unify/notifications/events'
    }
  };
}
