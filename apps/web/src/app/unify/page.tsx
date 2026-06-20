'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, type UnifyNotificationEvent, type UnifyNotificationsStatus, type UnifySubscription } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/** Internal webhook — not shown to users */
const INTERNAL_WEBHOOK = '/api/unify/notifications/webhook';

export default function UnifyNotificationsPage() {
  const [status, setStatus] = useState<UnifyNotificationsStatus | null>(null);
  const [subscriptions, setSubscriptions] = useState<UnifySubscription[]>([]);
  const [events, setEvents] = useState<UnifyNotificationEvent[]>([]);
  const [topic, setTopic] = useState('conversations');
  const [subjectFilter, setSubjectFilter] = useState('proof');
  const [testEvent, setTestEvent] = useState('message.created');
  const [conversationId, setConversationId] = useState('conv-recruitment-001');
  const [message, setMessage] = useState('Customer saved £40,000 in operational costs after 3 months.');
  const [loading, setLoading] = useState<'subscribe' | 'test' | 'demo' | null>(null);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [s, subs, ev] = await Promise.all([
        api.getUnifyNotificationsStatus(),
        api.getUnifySubscriptions(),
        api.getUnifyNotificationEvents()
      ]);
      setStatus(s);
      setSubscriptions(subs);
      setEvents(ev);
    } catch {
      /* server starting */
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function handleSubscribe() {
    setLoading('subscribe');
    setError('');
    try {
      await api.subscribeUnifyNotifications({
        topic,
        subjectFilter,
        webhookUrl: INTERNAL_WEBHOOK
      });
      setLastResult(`You're subscribed — we'll deliver ${topic} notifications matching "${subjectFilter}".`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Subscribe failed');
    } finally {
      setLoading(null);
    }
  }

  async function handleTest() {
    setLoading('test');
    setError('');
    try {
      const res = await api.testUnifyNotification({ event: testEvent, conversationId, message });
      setLastResult(`Test notification sent to ${res.subscriptionsNotified} listener${res.subscriptionsNotified !== 1 ? 's' : ''}.`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed');
    } finally {
      setLoading(null);
    }
  }

  async function runQuickDemo() {
    setLoading('demo');
    setError('');
    try {
      await api.subscribeUnifyNotifications({
        topic: 'conversations',
        subjectFilter: 'proof',
        webhookUrl: INTERNAL_WEBHOOK
      });
      const res = await api.testUnifyNotification({
        event: 'message.created',
        conversationId: 'conv-recruitment-001',
        message: 'Our recruiters now save 12 hours per week on manual screening.'
      });
      setLastResult(`Demo complete — ${res.subscriptionsNotified} notification${res.subscriptionsNotified !== 1 ? 's' : ''} received. Check Live events below.`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Demo failed');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Unify Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Get live alerts when new customer proof appears in conversations — powered by Unify (demo mode, no setup required).
          </p>
        </div>
        <Button size="lg" onClick={runQuickDemo} disabled={loading !== null} className="min-w-[220px]">
          {loading === 'demo' ? 'Running demo…' : '⚡ Quick Demo (Subscribe + Test)'}
        </Button>
      </div>

      <Card className="border-emerald-500/30 bg-emerald-500/5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-400">Unify Connected</Badge>
          {status && (
            <>
              <Badge className="bg-secondary text-muted-foreground">{status.subscriptions} active listeners</Badge>
              <Badge className="bg-secondary text-muted-foreground">{status.eventsReceived} events received</Badge>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Notifications are delivered automatically to ProofLoop when customer proof is detected in conversations.
        </p>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">{error}</div>
      )}
      {lastResult && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm text-emerald-400">{lastResult}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 border-2 border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-lg">1. Subscribe</h2>
            <Badge className="bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">Start here</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Choose what conversation updates you want to hear about.</p>
          <label className="block text-sm font-medium text-foreground">Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <label className="block text-sm font-medium text-foreground">Filter by subject</label>
          <input
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            placeholder="e.g. proof, ROI, testimonial"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <div className="pt-4 border-t border-emerald-500/20">
            <Button
              size="lg"
              onClick={handleSubscribe}
              disabled={loading !== null}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/60 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
            >
              {loading === 'subscribe' ? 'Subscribing…' : '✓ Subscribe to notifications'}
            </Button>
          </div>
        </Card>

        <Card className="space-y-4 border border-border">
          <h2 className="font-semibold text-lg">2. Send a test notification</h2>
          <p className="text-sm text-muted-foreground">Preview what a live Unify alert looks like in ProofLoop.</p>
          <label className="block text-sm font-medium text-foreground">Event type</label>
          <input
            value={testEvent}
            onChange={(e) => setTestEvent(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <label className="block text-sm font-medium text-foreground">Conversation</label>
          <input
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <label className="block text-sm font-medium text-foreground">Message preview</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="pt-4 border-t border-border">
            <Button
              size="lg"
              variant={subscriptions.length === 0 ? 'outline' : 'default'}
              onClick={handleTest}
              disabled={loading !== null || subscriptions.length === 0}
              className="w-full"
            >
              {loading === 'test' ? 'Sending…' : '→ Send test notification'}
            </Button>
          </div>
          {subscriptions.length === 0 && (
            <p className="text-xs text-amber-400 text-center">Subscribe first (step 1) or use Quick Demo above.</p>
          )}
        </Card>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Your subscriptions ({subscriptions.length})</h2>
          {subscriptions.length === 0 ? (
            <Card className="text-sm text-muted-foreground text-center py-8">No subscriptions yet — click Subscribe above.</Card>
          ) : (
            subscriptions.map((sub) => (
              <Card key={sub.subscriptionId} className="space-y-2 py-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/20 text-primary">{sub.topic}</Badge>
                  <Badge className="bg-secondary text-muted-foreground">{sub.subjectFilter}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Active since {new Date(sub.createdAt).toLocaleString()}</p>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Live events ({events.length})</h2>
            <Badge className="bg-emerald-500/20 text-emerald-400 animate-pulse">Live</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Recent notifications received by ProofLoop.</p>
          {events.length === 0 ? (
            <Card className="text-sm text-muted-foreground text-center py-8">
              No events yet. Subscribe and send a test notification to see them here.
            </Card>
          ) : (
            events.map((ev) => (
              <Card key={ev.id} className="space-y-2 py-4 border-l-4 border-l-emerald-500/50">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400">{ev.event}</Badge>
                  <span className="text-xs text-muted-foreground">{ev.conversationId}</span>
                </div>
                <p className="text-sm">&ldquo;{ev.message}&rdquo;</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(ev.receivedAt).toLocaleString()}
                </p>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
