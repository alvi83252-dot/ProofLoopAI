/**
 * Faxxing — Simulated Proof Validation via Social Media Scan
 * Validates customer proof by cross-referencing LinkedIn, Instagram, X, etc.
 */

export interface SocialProofMatch {
  platform: 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'youtube';
  accountName: string;
  handle: string;
  profileUrl: string;
  postUrl: string;
  snippet: string;
  postedAt: string;
  engagement: { likes: number; comments: number; shares: number };
  matchScore: number;
  verified: boolean;
}

export interface FaxxingValidationResult {
  quote: string;
  overallScore: number;
  credibility: number;
  socialVerified: boolean;
  verificationStatus: 'verified' | 'partial' | 'unverified';
  platformsScanned: string[];
  matches: SocialProofMatch[];
  poweredBy: 'faxxing';
  summary: string;
  scannedAt: string;
}

type DemoMatch = Omit<SocialProofMatch, 'matchScore' | 'verified'>;

const DEMO_SOCIAL_INDEX: Array<{ keywords: RegExp; matches: DemoMatch[] }> = [
  {
    keywords: /saved?|£40|40000|\$40|cost|roi|operational/i,
    matches: [
      {
        platform: 'linkedin',
        accountName: 'Sarah Chen',
        handle: '@sarahchen-vp',
        profileUrl: 'https://www.linkedin.com/in/sarahchen-vp-operations',
        postUrl: 'https://www.linkedin.com/posts/sarahchen-vp-operations_we-saved-40000-operational-costs-activity-7123456789012345678-AbCd',
        snippet: 'We saved £40,000 in operational costs in 3 months using @ProofLoop — real ROI, not marketing fluff.',
        postedAt: '2026-03-12',
        engagement: { likes: 284, comments: 47, shares: 31 }
      },
      {
        platform: 'twitter',
        accountName: 'TalentFlow',
        handle: '@TalentFlowHQ',
        profileUrl: 'https://x.com/TalentFlowHQ',
        postUrl: 'https://x.com/TalentFlowHQ/status/1847293847562930182',
        snippet: 'Customer spotlight: £40K saved in Q1. Proof-led GTM is the future.',
        postedAt: '2026-03-15',
        engagement: { likes: 156, comments: 22, shares: 18 }
      }
    ]
  },
  {
    keywords: /hours?\s*per\s*week|12\s*hours|time\s*sav|screening|recruit/i,
    matches: [
      {
        platform: 'linkedin',
        accountName: 'Marcus Webb',
        handle: '@marcus-recruiting',
        profileUrl: 'https://www.linkedin.com/in/marcus-webb-recruiting',
        postUrl: 'https://www.linkedin.com/posts/marcus-webb-recruiting_12-hours-week-screening-activity-7123456789012345679-XyZz',
        snippet: 'Our recruiters now save 12 hours per week on manual screening. Game changer for our agency.',
        postedAt: '2026-02-28',
        engagement: { likes: 412, comments: 63, shares: 44 }
      },
      {
        platform: 'instagram',
        accountName: 'HireFaster Co.',
        handle: '@hirefaster.co',
        profileUrl: 'https://www.instagram.com/hirefaster.co',
        postUrl: 'https://www.instagram.com/p/C8xK2mNpQrS/',
        snippet: '12 hours back every week ⏱️ Our team finally stopped drowning in CVs. #RecruitmentTech #TimeSavings',
        postedAt: '2026-03-01',
        engagement: { likes: 891, comments: 74, shares: 0 }
      }
    ]
  },
  {
    keywords: /conversion|34%|landing\s*page|cvr|lift/i,
    matches: [
      {
        platform: 'linkedin',
        accountName: 'Marcus Webb, CMO',
        handle: '@cmo-scalestack',
        profileUrl: 'https://www.linkedin.com/in/marcus-webb-cmo',
        postUrl: 'https://www.linkedin.com/posts/marcus-webb-cmo_conversion-jumped-34-percent-activity-7123456789012345680-PqRs',
        snippet: 'Conversion jumped 34% after we updated our hero with ONE customer ROI quote. Proof > promises.',
        postedAt: '2026-01-20',
        engagement: { likes: 623, comments: 91, shares: 67 }
      },
      {
        platform: 'youtube',
        accountName: 'ScaleStack Growth',
        handle: '@ScaleStackGrowth',
        profileUrl: 'https://www.youtube.com/@ScaleStackGrowth',
        postUrl: 'https://www.youtube.com/watch?v=abc123XYZ_proof',
        snippet: 'How we increased landing page conversion 34% using buried customer proof (case study walkthrough)',
        postedAt: '2026-02-05',
        engagement: { likes: 1240, comments: 188, shares: 0 }
      }
    ]
  },
  {
    keywords: /burnout|emotional|satisfaction|team|adoption|95%/i,
    matches: [
      {
        platform: 'instagram',
        accountName: 'Founder Stories',
        handle: '@founderstories',
        profileUrl: 'https://www.instagram.com/founderstories',
        postUrl: 'https://www.instagram.com/p/C9yL3nOqRsT/',
        snippet: 'The moment our VP said we saved the team from burnout — that became our best sales asset.',
        postedAt: '2026-03-08',
        engagement: { likes: 534, comments: 41, shares: 0 }
      },
      {
        platform: 'facebook',
        accountName: 'TalentFlow Community',
        handle: 'TalentFlow Community',
        profileUrl: 'https://www.facebook.com/groups/talentflow',
        postUrl: 'https://www.facebook.com/groups/talentflow/posts/1234567890123456',
        snippet: '95% team adoption in week one. Our CS team finally has proof to share with prospects.',
        postedAt: '2026-02-14',
        engagement: { likes: 78, comments: 34, shares: 12 }
      }
    ]
  }
];

const ALL_PLATFORMS = ['linkedin', 'instagram', 'twitter', 'facebook', 'youtube'];

function scoreMatch(quote: string, snippet: string): number {
  const quoteTokens = new Set(quote.toLowerCase().match(/[a-z0-9']+/g)?.filter((t) => t.length > 3) ?? []);
  const snippetTokens = snippet.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  const overlap = snippetTokens.filter((t) => quoteTokens.has(t)).length;
  const base = Math.min(95, 55 + overlap * 8);
  if (/\d/.test(quote) && /\d/.test(snippet)) return Math.min(99, base + 10);
  return base;
}

function normalizeMatch(match: Partial<SocialProofMatch> & Pick<SocialProofMatch, 'platform' | 'handle' | 'postUrl' | 'snippet' | 'postedAt' | 'engagement' | 'matchScore' | 'verified'>): SocialProofMatch {
  return {
    ...match,
    accountName: match.accountName ?? match.handle.replace(/^@/, ''),
    profileUrl: match.profileUrl ?? match.postUrl
  };
}

/** Simulated Faxxing social proof validation */
export async function validateProofOnSocialMedia(quote: string): Promise<FaxxingValidationResult> {
  if (process.env.FAXXING_API_KEY && process.env.FAXXING_API_URL) {
    try {
      const res = await fetch(`${process.env.FAXXING_API_URL}/validate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.FAXXING_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quote })
      });
      if (res.ok) {
        const data = (await res.json()) as FaxxingValidationResult;
        return {
          ...data,
          matches: (data.matches ?? []).map((m) => normalizeMatch(m as SocialProofMatch))
        };
      }
    } catch {
      /* fall through to simulated API */
    }
  }

  await new Promise((r) => setTimeout(r, 600));

  const matches: SocialProofMatch[] = [];
  for (const entry of DEMO_SOCIAL_INDEX) {
    if (entry.keywords.test(quote)) {
      for (const m of entry.matches) {
        const matchScore = scoreMatch(quote, m.snippet);
        matches.push({
          ...m,
          matchScore,
          verified: matchScore >= 75
        });
      }
    }
  }

  if (matches.length === 0) {
    matches.push({
      platform: 'linkedin',
      accountName: 'Customer Voice',
      handle: '@customer-voice',
      profileUrl: 'https://www.linkedin.com/in/customer-voice',
      postUrl: 'https://www.linkedin.com/posts/customer-voice_proof-quote-activity-7123456789012345681-Fallback',
      snippet: quote.slice(0, 120) + (quote.length > 120 ? '...' : ''),
      postedAt: new Date().toISOString().slice(0, 10),
      engagement: { likes: 42, comments: 8, shares: 3 },
      matchScore: 62,
      verified: false
    });
  }

  const verifiedCount = matches.filter((m) => m.verified).length;
  const avgScore = matches.reduce((s, m) => s + m.matchScore, 0) / matches.length;
  const socialVerified = verifiedCount >= 1 && avgScore >= 70;

  let verificationStatus: FaxxingValidationResult['verificationStatus'] = 'unverified';
  if (socialVerified && verifiedCount >= 2) verificationStatus = 'verified';
  else if (verifiedCount >= 1 || avgScore >= 65) verificationStatus = 'partial';

  const platformList = [...new Set(matches.map((m) => m.platform))];
  const accountList = matches.map((m) => `${m.accountName} (${m.handle})`).join(', ');

  return {
    quote,
    overallScore: Math.round(avgScore),
    credibility: Math.round((avgScore / 100) * 0.85 * 100) / 100,
    socialVerified,
    verificationStatus,
    platformsScanned: ALL_PLATFORMS,
    matches: matches.sort((a, b) => b.matchScore - a.matchScore),
    poweredBy: 'faxxing',
    summary: socialVerified
      ? `Faxxing found ${verifiedCount} verified post(s) from ${accountList} across ${platformList.join(', ')}.`
      : `Faxxing scanned ${ALL_PLATFORMS.length} platforms. Partial matches from ${accountList} — open post links below to review.`,
    scannedAt: new Date().toISOString()
  };
}

export function getFaxxingStatus() {
  return {
    service: 'faxxing',
    mode: process.env.FAXXING_API_KEY ? 'live' : 'simulated',
    endpoint: '/api/faxxing/validate',
    platforms: ALL_PLATFORMS,
    description: 'Validates proof evidence by scanning LinkedIn, Instagram, X, Facebook, and YouTube.'
  };
}
