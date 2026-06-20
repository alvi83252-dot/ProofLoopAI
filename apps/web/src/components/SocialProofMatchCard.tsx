import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { FaxxingSocialMatch } from '@/lib/api';

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  twitter: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  facebook: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  youtube: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  facebook: 'Facebook',
  youtube: 'YouTube'
};

function platformIcon(platform: string) {
  const icons: Record<string, string> = {
    linkedin: 'in',
    instagram: 'ig',
    twitter: '𝕏',
    facebook: 'fb',
    youtube: '▶'
  };
  return icons[platform] ?? '•';
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 36 ? `${u.pathname.slice(0, 36)}…` : u.pathname;
    return `${u.hostname}${path}`;
  } catch {
    return url;
  }
}

interface SocialProofMatchCardProps {
  match: FaxxingSocialMatch;
}

export function SocialProofMatchCard({ match }: SocialProofMatchCardProps) {
  const platformClass = PLATFORM_COLORS[match.platform] ?? 'bg-secondary text-muted-foreground';
  const platformLabel = PLATFORM_LABELS[match.platform] ?? match.platform;

  return (
    <Card hover className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${platformClass}`}>
            {platformIcon(match.platform)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{match.accountName || match.handle}</p>
            <a
              href={match.profileUrl || match.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {match.handle}
            </a>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge className={platformClass}>{platformLabel}</Badge>
              {match.verified && <Badge className="bg-emerald-500/20 text-emerald-400">Verified</Badge>}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-primary">{match.matchScore}%</p>
          <p className="text-xs text-muted-foreground">match</p>
        </div>
      </div>

      <blockquote className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm italic text-foreground leading-relaxed">
        &ldquo;{match.snippet}&rdquo;
      </blockquote>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>❤️ {match.engagement.likes.toLocaleString()}</span>
        <span>💬 {match.engagement.comments.toLocaleString()}</span>
        <span>↗ {match.engagement.shares.toLocaleString()}</span>
        <span>📅 {match.postedAt}</span>
      </div>

      <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exact post</p>
        <a
          href={match.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-medium text-primary hover:underline break-all"
        >
          {match.postUrl}
        </a>
        <p className="text-xs text-muted-foreground">{shortUrl(match.postUrl)}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={match.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open post →
          </a>
          <a
            href={match.profileUrl || match.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50"
          >
            View account →
          </a>
        </div>
      </div>
    </Card>
  );
}

export { PLATFORM_COLORS, PLATFORM_LABELS };
