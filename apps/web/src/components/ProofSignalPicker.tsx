'use client';

import { Badge } from '@/components/ui/Badge';
import type { TrustSignal } from '@/lib/api';

interface ProofSignalPickerProps {
  signals: TrustSignal[];
  value: string;
  onChange: (id: string) => void;
  emptyMessage?: string;
}

export function ProofSignalPicker({
  signals,
  value,
  onChange,
  emptyMessage = 'No trust signals yet. Run Proof Discovery first.'
}: ProofSignalPickerProps) {
  if (signals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="Trust signals"
      className="max-h-56 overflow-y-auto rounded-lg border border-border bg-background"
    >
      {signals.map((signal) => {
        const selected = signal.id === value;
        return (
          <button
            key={signal.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onChange(signal.id)}
            className={`block w-full border-b border-border last:border-b-0 px-4 py-3 text-left transition-colors ${
              selected
                ? 'bg-primary/15 ring-1 ring-inset ring-primary/40'
                : 'hover:bg-muted/40'
            }`}
          >
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30">{signal.signalType}</Badge>
              <Badge className="bg-secondary text-muted-foreground">{signal.category}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">{signal.proofScore}/100</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground line-clamp-2">&ldquo;{signal.quote}&rdquo;</p>
          </button>
        );
      })}
    </div>
  );
}

/** Client-side filter matching API cleanTrustSignals */
export function cleanTrustSignals(signals: TrustSignal[]): TrustSignal[] {
  const seen = new Set<string>();

  return signals
    .filter((s) => {
      const q = s.quote.trim();
      if (q.length < 20) return false;
      if (/^Subject:/i.test(q)) return false;
      if (/^@\{/.test(q) || /System\.Object/i.test(q)) return false;

      const key = q.toLowerCase().replace(/\s+/g, ' ').slice(0, 100);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.proofScore - a.proofScore);
}
