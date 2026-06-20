'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ContentIdea {
  title: string;
  format: string;
  angle: string;
}

interface LandingPageAngle {
  headline: string;
  hook: string;
  proofQuote: string;
}

interface NextAction {
  action: string;
  impact: string;
  effort: string;
  source: string;
}

interface PlaybookContent {
  icp: string;
  positioning: string;
  outreachSystem: string[];
  contentIdeas: ContentIdea[];
  landingPageAngles: LandingPageAngle[];
  nextActions: NextAction[];
  growthLoops: string[];
  conversionFramework: string[];
  playbook: string;
}

interface Playbook {
  id: string;
  title: string;
  type: string;
  content: PlaybookContent;
  feedback?: { rating: string }[];
}

interface GtmMetrics {
  playbooksGenerated: number;
  feedbackSubmitted: number;
  helpfulCount: number;
  notHelpfulCount: number;
}

interface SignalUsed {
  id: string;
  quote: string;
  proofScore: number;
  signalType: string;
}

export default function GtmPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [generating, setGenerating] = useState(false);
  const [metrics, setMetrics] = useState<GtmMetrics | null>(null);
  const [signalsUsed, setSignalsUsed] = useState<SignalUsed[]>([]);
  const [poweredBy, setPoweredBy] = useState('demo');
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);

  useEffect(() => {
    api.getGtmPlaybooks().then((d) => {
      setPlaybooks(d.playbooks as Playbook[]);
      setMetrics(d.metrics as GtmMetrics);
    });
  }, []);

  async function generate() {
    setGenerating(true);
    try {
      const res = await api.generateGtmFromSignals();
      setPlaybooks((prev) => [res.playbook as Playbook, ...prev]);
      setMetrics(res.metrics as GtmMetrics);
      setSignalsUsed(res.signalsUsed as SignalUsed[]);
      setPoweredBy(res.poweredBy);
    } finally {
      setGenerating(false);
    }
  }

  async function submitFeedback(playbookId: string, rating: 'helpful' | 'not_helpful', actionIndex?: number) {
    setFeedbackLoading(playbookId);
    try {
      const res = await api.submitGtmFeedback({ playbookId, rating, actionIndex });
      setMetrics(res.metrics as GtmMetrics);
      setPlaybooks((prev) =>
        prev.map((p) =>
          p.id === playbookId
            ? { ...p, feedback: [...(p.feedback ?? []), { rating }] }
            : p
        )
      );
    } finally {
      setFeedbackLoading(null);
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-emerald-400 bg-emerald-500/10';
      case 'Medium': return 'text-amber-400 bg-amber-500/10';
      case 'Low': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Low': return 'text-emerald-400 bg-emerald-500/10';
      case 'Medium': return 'text-amber-400 bg-amber-500/10';
      case 'High': return 'text-red-400 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">GTM System Generator</h1>
          <p className="text-muted-foreground mt-2">
            Take your top trust signals and generate a complete GTM system — ICP, positioning, outreach, content, and prioritized next actions.
          </p>
        </div>
        <Button onClick={generate} disabled={generating}>
          {generating ? 'Generating...' : 'Generate New GTM System'}
        </Button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold gradient-text">{metrics.playbooksGenerated}</div>
            <div className="text-xs text-muted-foreground mt-1">Playbooks Generated</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{metrics.helpfulCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Marked Helpful</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{metrics.notHelpfulCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Marked Not Helpful</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{metrics.feedbackSubmitted}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Feedback</div>
          </Card>
        </div>
      )}

      {signalsUsed.length > 0 && (
        <Card className="border-blue-500/30 bg-blue-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Top 3 Signals Used</Badge>
            <Badge className={poweredBy === 'scaile' ? 'bg-violet-500/20 text-violet-400' : 'bg-secondary text-muted-foreground'}>
              {poweredBy === 'scaile' ? 'Scaile' : 'Demo Mode'}
            </Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {signalsUsed.map((s, i) => (
              <div key={s.id} className="text-sm bg-blue-500/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-blue-400">#{i + 1}</span>
                  <span className="font-semibold text-blue-300">{s.signalType}</span>
                  <span className="font-mono text-xs text-muted-foreground">{s.proofScore}/100</span>
                </div>
                <p className="text-muted-foreground text-xs line-clamp-2">{s.quote}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {playbooks.length === 0 && !generating && (
        <Card className="border-dashed border-muted-foreground/30 p-12 text-center">
          <p className="text-muted-foreground mb-2">No GTM systems generated yet</p>
          <p className="text-sm text-muted-foreground/60">Click &quot;Generate New GTM System&quot; to create your first playbook from your top trust signals.</p>
        </Card>
      )}

      {playbooks.map((playbook) => (
        <Card key={playbook.id} hover className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{playbook.title}</h2>
              <Badge className="bg-primary/20 text-primary">{playbook.type}</Badge>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => submitFeedback(playbook.id, 'helpful')}
                disabled={feedbackLoading === playbook.id}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Helpful
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => submitFeedback(playbook.id, 'not_helpful')}
                disabled={feedbackLoading === playbook.id}
                className="text-red-400 hover:text-red-300"
              >
                Not Helpful
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">Ideal Customer Profile</h3>
            <p className="text-sm text-muted-foreground">{playbook.content.icp}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">Positioning</h3>
            <p className="text-sm text-muted-foreground">{playbook.content.positioning}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-3">Outreach Sequence</h3>
            <ul className="space-y-2">
              {playbook.content.outreachSystem.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-primary font-mono text-xs mt-0.5">{i + 1}.</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-3">Content Ideas</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {playbook.content.contentIdeas.map((idea, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3 border border-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{idea.title}</span>
                    <Badge className="bg-secondary text-secondary-foreground text-[10px]">{idea.format}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{idea.angle}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-3">Landing Page Angles</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {playbook.content.landingPageAngles.map((angle, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3 border border-muted">
                  <p className="text-sm font-semibold mb-1">{angle.headline}</p>
                  <p className="text-xs text-muted-foreground mb-2">{angle.hook}</p>
                  <blockquote className="text-xs italic text-primary/80 border-l-2 border-primary/30 pl-2">
                    {angle.proofQuote}
                  </blockquote>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-3">Next Actions</h3>
            <div className="space-y-2">
              {playbook.content.nextActions.map((item, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 p-3 border border-muted">
                  <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                  <span className="text-sm flex-1 min-w-[200px]">{item.action}</span>
                  <Badge className={`${getImpactColor(item.impact)} text-xs`}>Impact: {item.impact}</Badge>
                  <Badge className={`${getEffortColor(item.effort)} text-xs`}>Effort: {item.effort}</Badge>
                  <Badge className="bg-secondary text-secondary-foreground text-xs">{item.source}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold mb-3">Growth Loops</h3>
              <ul className="space-y-2">
                {playbook.content.growthLoops.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-emerald-400 shrink-0">↻</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Conversion Framework</h3>
              <ul className="space-y-2">
                {playbook.content.conversionFramework.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-blue-400 shrink-0">→</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="text-sm font-semibold text-primary mb-2">Playbook Narrative</h3>
            <p className="text-sm">{playbook.content.playbook}</p>
          </div>

          {playbook.feedback && playbook.feedback.length > 0 && (
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>Feedback: {playbook.feedback.filter((f) => f.rating === 'helpful').length} helpful</span>
              <span>·</span>
              <span>{playbook.feedback.filter((f) => f.rating === 'not_helpful').length} not helpful</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
