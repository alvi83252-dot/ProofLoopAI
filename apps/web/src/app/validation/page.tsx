'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, type TrustSignal, type FaxxingValidationResult } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ProofSignalPicker, cleanTrustSignals } from '@/components/ProofSignalPicker';
import { SocialProofMatchCard, PLATFORM_COLORS } from '@/components/SocialProofMatchCard';

const STATUS_COLORS = {
  verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  partial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  unverified: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function ValidationPage() {
  const [signals, setSignals] = useState<TrustSignal[]>([]);
  const [selectedSignalId, setSelectedSignalId] = useState('');
  const [customQuote, setCustomQuote] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<FaxxingValidationResult | null>(null);
  const [faxxingMode, setFaxxingMode] = useState('simulated');
  const [platforms, setPlatforms] = useState<string[]>([]);

  const cleanedSignals = useMemo(() => cleanTrustSignals(signals), [signals]);

  useEffect(() => {
    api.getTrustSignals().then((s) => {
      setSignals(s);
      const cleaned = cleanTrustSignals(s);
      if (cleaned[0]) setSelectedSignalId(cleaned[0].id);
    });
    api.getFaxxingStatus().then((s) => {
      setFaxxingMode(s.mode);
      setPlatforms(s.platforms);
    }).catch(() => {});
  }, []);

  async function validate(quote: string) {
    if (!quote.trim()) return;
    setValidating(true);
    setResult(null);
    try {
      setResult(await api.validateWithFaxxing(quote));
    } finally {
      setValidating(false);
    }
  }

  const selectedSignal = cleanedSignals.find((s) => s.id === selectedSignalId);
  const activeQuote = customQuote.trim() || selectedSignal?.quote || '';
  const canValidate = Boolean(activeQuote.trim()) && !validating;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Proof Validation</h1>
        <p className="text-muted-foreground mt-2">
          Faxxing validates proof evidence by scanning social media — LinkedIn, Instagram, X, Facebook, and YouTube.
        </p>
      </div>

      <Card className="border-orange-500/30 bg-orange-500/5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Faxxing</Badge>
          <Badge className="bg-secondary text-muted-foreground">Mode: {faxxingMode}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Scans: {platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' · ')}
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <h2 className="font-semibold">Select proof to validate</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Click a signal below — no custom quote needed. {cleanedSignals.length} available.
            </p>
          </div>

          <ProofSignalPicker
            signals={cleanedSignals}
            value={selectedSignalId}
            onChange={(id) => {
              setSelectedSignalId(id);
              setCustomQuote('');
            }}
          />

          {selectedSignal && !customQuote.trim() && (
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
              Ready to validate: <span className="font-medium">{selectedSignal.signalType}</span>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Or paste a custom quote (optional):</p>
            <textarea
              value={customQuote}
              onChange={(e) => setCustomQuote(e.target.value)}
              placeholder="Paste a customer proof quote to validate on social media..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <Button onClick={() => validate(activeQuote)} disabled={!canValidate} className="w-full sm:w-auto">
            {validating ? 'Scanning social media...' : 'Validate with Faxxing'}
          </Button>
        </Card>

        {result && (
          <Card glow className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Validation Result</h2>
              <Badge className={STATUS_COLORS[result.verificationStatus]}>{result.verificationStatus}</Badge>
            </div>
            <ScoreRing score={result.overallScore} label="Social Proof Score" size="md" />
            <p className="text-sm italic">&ldquo;{result.quote}&rdquo;</p>
            <p className="text-sm text-muted-foreground">{result.summary}</p>

            {result.matches.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Accounts found ({result.matches.length})
                </p>
                {result.matches.map((match) => (
                  <div key={`${match.platform}-${match.postUrl}`} className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge className={PLATFORM_COLORS[match.platform] ?? ''}>{match.platform}</Badge>
                    <a href={match.profileUrl || match.postUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary">
                      {match.accountName || match.handle}
                    </a>
                    <span className="text-muted-foreground">{match.handle}</span>
                    <a
                      href={match.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline ml-auto"
                    >
                      View post →
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {result.platformsScanned.map((p) => (
                <Badge key={p} className={PLATFORM_COLORS[p] ?? 'bg-secondary text-muted-foreground'}>{p}</Badge>
              ))}
            </div>
          </Card>
        )}
      </div>

      {result && result.matches.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="font-semibold text-lg">Social Media Matches</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Each match links to the exact post and the account profile.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {result.matches.map((match) => (
              <SocialProofMatchCard key={`${match.platform}-${match.postUrl}`} match={match} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
