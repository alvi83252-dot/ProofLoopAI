'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type DashboardData } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';

const features = [
  { title: 'Proof Discovery', desc: 'Upload files or paste text to extract hidden trust signals', href: '/discovery', icon: '🔍' },
  { title: 'Trust Signals', desc: 'Ranked proof with scores, categories, and recommended uses', href: '/trust-signals', icon: '🛡️' },
  { title: 'GTM Playbooks', desc: 'AI-generated outreach systems and conversion frameworks', href: '/gtm', icon: '🚀' },
  { title: 'Content Studio', desc: 'Transform proof into LinkedIn posts, emails, and case studies', href: '/content', icon: '✍️' }
];

const workflow = [
  'Upload customer data', 'Extract outcomes & ROI', 'Lightfern assigns Proof Scores', 'Rank trust signals',
  'Expand audiences', 'Generate GTM systems', 'Amplify proof content', 'Store in Proof CRM', 'Get growth recommendations'
];

export default function HomePage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.getDashboard().then(setDashboard).catch(() => setDashboard(null));
  }, []);

  return (
    <div className="space-y-12 animate-fade-in">
      <section className="relative text-center py-12 lg:py-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6 animate-slide-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Demo mode — value in 60 seconds
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4 animate-slide-up">
          Turn hidden customer<br />
          <span className="gradient-text">proof into your growth engine</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up">
          Corroba discovers proof buried in emails, reviews, calls, and support tickets — then transforms it into trust signals, GTM assets, and growth recommendations.
        </p>
        <div className="flex flex-wrap justify-center gap-4 animate-slide-up">
          <Button href="/discovery" size="lg">Start Discovering Proof</Button>
          <Button href="/trust-signals" variant="outline" size="lg">View Trust Signals</Button>
        </div>
      </section>

      {dashboard && (
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Proof Sources', value: dashboard.stats.totalProofSources },
            { label: 'Trust Signals', value: dashboard.stats.trustSignalsFound },
            { label: 'Avg Proof Score', value: dashboard.stats.avgProofScore },
            { label: 'Assets Generated', value: dashboard.stats.assetsGenerated },
            { label: 'Conversion Lift', value: `${dashboard.stats.conversionLift}%` }
          ].map((stat) => (
            <Card key={stat.label} hover className="text-center">
              <p className="text-2xl lg:text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          ))}
        </section>
      )}

      {dashboard?.topSignals && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Top Trust Signals</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {dashboard.topSignals.map((signal) => (
              <Card key={signal.id} hover className="flex gap-4">
                <ScoreRing score={signal.proofScore} size="sm" label="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">{signal.signalType}</Badge>
                    <span className="text-xs text-muted-foreground">{signal.category}</span>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-2">&ldquo;{signal.quote}&rdquo;</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {signal.recommendedUses.slice(0, 3).map((use) => (
                      <Badge key={use} className="bg-secondary text-secondary-foreground">{use}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-6">Platform Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="block group">
              <Card hover className="h-full">
                <span className="text-3xl mb-3 block">{feature.icon}</span>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">AI Workflow</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />
          <div className="space-y-4">
            {workflow.map((step, i) => (
              <div key={step} className="flex items-center gap-4 pl-10 relative animate-slide-up">
                <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-lg shadow-primary/50" />
                <Card hover className="flex-1 py-3 px-4">
                  <span className="text-xs text-primary font-mono mr-3">0{i + 1}</span>
                  <span className="text-sm">{step}</span>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
