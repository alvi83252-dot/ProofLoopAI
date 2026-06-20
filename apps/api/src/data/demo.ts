export interface ExtractedSignal {
  quote: string;
  category: string;
  signalType: string;
  strength: number;
  proofScore: number;
  credibility: number;
  specificity: number;
  revenueImpact: number;
  emotionalImpact: number;
  conversionPotential: number;
  recommendedUses: string[];
  metadata?: Record<string, unknown>;
}

export interface AudienceMatch {
  name: string;
  description: string;
  icpMatch: number;
  industry: string;
  companySize: string;
  resonanceScore: number;
}

export interface GtmPlaybookContent {
  icp: string;
  positioning: string;
  outreachSystem: string[];
  contentIdeas: { title: string; format: string; angle: string }[];
  landingPageAngles: { headline: string; hook: string; proofQuote: string }[];
  nextActions: { action: string; impact: string; effort: string; source: string }[];
  growthLoops: string[];
  conversionFramework: string[];
  playbook: string;
}

export interface ContentAssetResult {
  type: string;
  title: string;
  content: string;
  platform?: string;
}

export interface GrowthRecommendationResult {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  effort: number;
  category: string;
  proofSignalIds: string[];
  actionItems: string[];
}

export const DEMO_SOURCES = [
  {
    type: 'email',
    title: 'Enterprise Customer Email',
    content: `Subject: Incredible ROI after 3 months

Hi team,

We saved £40,000 in operational costs after using your platform for just 3 months. Our recruiters now save 12 hours per week on manual screening. The onboarding was seamless and our team adoption hit 95% within the first week.

Before switching, we struggled with long sales cycles and generic outreach. Your proof-driven approach helped us close 3 enterprise deals this quarter.

Best,
Sarah Chen, VP Operations at TalentFlow`
  },
  {
    type: 'testimonial',
    title: 'Customer Testimonial',
    content: `"ProofLoop helped us discover testimonials buried in 2 years of support tickets. We found 47 trust signals we never knew existed. Conversion on our landing page jumped 34% after updating the hero with a single ROI quote." — Marcus Webb, CMO at ScaleStack`
  },
  {
    type: 'transcript',
    title: 'Sales Call Excerpt',
    content: `Prospect: We tried three competitors but none could surface proof from our existing customer data.

Rep: That's exactly what we solve. One customer reduced their sales cycle by 40% after deploying proof-ranked case studies to their SDR team.

Prospect: The emotional moment for us was seeing a customer quote about saving their team from burnout. That's the story we want to tell.

Rep: We can extract that automatically and rank it against 200+ other signals.`
  },
  {
    type: 'review',
    title: 'G2 Review',
    content: `5/5 stars — "Finally a tool that finds proof instead of generating fluff. We uncovered £2.3M in quantified outcomes from customer emails alone. Risk reduction was the top signal for our enterprise segment."`
  },
  {
    type: 'survey',
    title: 'NPS Survey Response',
    content: `NPS Score: 72

"What I love most is how it ranks trust signals by conversion potential. We went from generic marketing to proof-led GTM in 2 weeks. Time savings of 8 hours per rep per week. Customer satisfaction scores up 28 points."`
  }
];

export const DEMO_SIGNALS: ExtractedSignal[] = [
  {
    quote: 'We saved £40,000 in operational costs after using your platform for just 3 months.',
    category: 'Financial Impact',
    signalType: 'Revenue Savings',
    strength: 98,
    proofScore: 96,
    credibility: 0.94,
    specificity: 0.97,
    revenueImpact: 0.98,
    emotionalImpact: 0.72,
    conversionPotential: 0.95,
    recommendedUses: ['Landing Page Hero', 'Sales Deck', 'Case Study', 'LinkedIn Post']
  },
  {
    quote: 'Our recruiters now save 12 hours per week on manual screening.',
    category: 'Efficiency',
    signalType: 'Time Savings',
    strength: 94,
    proofScore: 91,
    credibility: 0.92,
    specificity: 0.95,
    revenueImpact: 0.78,
    emotionalImpact: 0.85,
    conversionPotential: 0.89,
    recommendedUses: ['Landing Page Hero', 'Sales Deck', 'LinkedIn Post', 'Email Campaign']
  },
  {
    quote: 'Conversion on our landing page jumped 34% after updating the hero with a single ROI quote.',
    category: 'Growth',
    signalType: 'Growth Improvement',
    strength: 92,
    proofScore: 90,
    credibility: 0.88,
    specificity: 0.91,
    revenueImpact: 0.85,
    emotionalImpact: 0.79,
    conversionPotential: 0.93,
    recommendedUses: ['Landing Page Hero', 'Case Study', 'GTM Playbook']
  },
  {
    quote: 'One customer reduced their sales cycle by 40% after deploying proof-ranked case studies.',
    category: 'Sales Enablement',
    signalType: 'Risk Reduction',
    strength: 89,
    proofScore: 87,
    credibility: 0.86,
    specificity: 0.88,
    revenueImpact: 0.82,
    emotionalImpact: 0.74,
    conversionPotential: 0.88,
    recommendedUses: ['Sales Deck', 'Case Study', 'Outreach Sequence']
  },
  {
    quote: 'The emotional moment was seeing a customer quote about saving their team from burnout.',
    category: 'Emotional Impact',
    signalType: 'Customer Satisfaction',
    strength: 86,
    proofScore: 84,
    credibility: 0.84,
    specificity: 0.76,
    revenueImpact: 0.65,
    emotionalImpact: 0.96,
    conversionPotential: 0.87,
    recommendedUses: ['LinkedIn Post', 'Founder Content', 'Brand Story']
  },
  {
    quote: 'We uncovered £2.3M in quantified outcomes from customer emails alone.',
    category: 'Financial Impact',
    signalType: 'Revenue Savings',
    strength: 95,
    proofScore: 93,
    credibility: 0.91,
    specificity: 0.94,
    revenueImpact: 0.97,
    emotionalImpact: 0.68,
    conversionPotential: 0.91,
    recommendedUses: ['Landing Page Hero', 'Investor Deck', 'Case Study']
  },
  {
    quote: 'Team adoption hit 95% within the first week.',
    category: 'Product Adoption',
    signalType: 'Growth Improvement',
    strength: 82,
    proofScore: 80,
    credibility: 0.87,
    specificity: 0.89,
    revenueImpact: 0.71,
    emotionalImpact: 0.82,
    conversionPotential: 0.79,
    recommendedUses: ['Product Page', 'Onboarding Email', 'Sales Deck']
  },
  {
    quote: 'Time savings of 8 hours per rep per week with customer satisfaction scores up 28 points.',
    category: 'Efficiency',
    signalType: 'Time Savings',
    strength: 88,
    proofScore: 86,
    credibility: 0.89,
    specificity: 0.92,
    revenueImpact: 0.76,
    emotionalImpact: 0.88,
    conversionPotential: 0.84,
    recommendedUses: ['Email Campaign', 'LinkedIn Post', 'Case Study']
  }
];

export const DEMO_AUDIENCES: AudienceMatch[] = [
  {
    name: 'Recruitment Agencies',
    description: 'High-volume hiring firms seeking to reduce manual screening time',
    icpMatch: 94,
    industry: 'Staffing & Recruiting',
    companySize: '50-500 employees',
    resonanceScore: 92
  },
  {
    name: 'Staffing Companies',
    description: 'Enterprise staffing providers with ROI-focused procurement teams',
    icpMatch: 91,
    industry: 'Human Resources',
    companySize: '200-2000 employees',
    resonanceScore: 89
  },
  {
    name: 'Talent Platforms',
    description: 'SaaS platforms connecting employers with candidates at scale',
    icpMatch: 88,
    industry: 'HR Tech',
    companySize: '20-200 employees',
    resonanceScore: 86
  },
  {
    name: 'B2B SaaS Startups',
    description: 'Growth-stage startups needing proof-led GTM without large marketing teams',
    icpMatch: 85,
    industry: 'Software',
    companySize: '10-100 employees',
    resonanceScore: 84
  },
  {
    name: 'Customer Success Teams',
    description: 'CS leaders looking to surface and amplify customer outcomes',
    icpMatch: 82,
    industry: 'Cross-industry',
    companySize: '100-1000 employees',
    resonanceScore: 81
  }
];

export const DEMO_GTM_PLAYBOOKS = [
  {
    title: 'Proof-Led Outbound for Recruitment ICP',
    type: 'outreach',
    content: {
      icp: 'Recruitment agencies with 50-500 employees struggling with manual candidate screening',
      positioning: 'The proof-led GTM platform that turns hidden customer outcomes into your highest-converting sales asset — no case study writers required.',
      outreachSystem: [
        'Lead with the 12 hours/week time savings proof in first touch',
        'Follow up with £40K cost reduction case study for CFO persona',
        'Share emotional burnout prevention story for VP Operations',
        'Close with 34% landing page conversion lift social proof'
      ],
      contentIdeas: [
        { title: 'How Recruiters Save 12 Hours/Week with Proof-Led Outreach', format: 'LinkedIn Post', angle: 'Time savings narrative with specific metric' },
        { title: 'The £40K ROI Case Study That Closed 3 Enterprise Deals', format: 'Case Study', angle: 'Financial impact story with CFO angle' },
        { title: 'From Burnout to Breakthrough: The HR Story That Sells Itself', format: 'Blog Post', angle: 'Emotional proof for VP Operations persona' },
        { title: 'Proof-Led GTM: A New Category for B2B Revenue Teams', format: 'Thought Leadership', angle: 'Category creation for founder-led brand' }
      ],
      landingPageAngles: [
        { headline: 'Turn Customer Proof Into Your Growth Engine', hook: 'Stop writing case studies. Start surfacing the proof your customers already gave you.', proofQuote: '"We saved £40,000 in operational costs in just 3 months."' },
        { headline: 'The Proof You Need Is Already in Your Inbox', hook: '47 trust signals hidden in your customer conversations. One click to find them all.', proofQuote: '"Conversion jumped 34% after updating our hero with a single ROI quote."' },
        { headline: 'Close Deals Faster With Proof, Not Adjectives', hook: 'Enterprise buyers trust customer evidence over marketing claims. Here\'s your evidence.', proofQuote: '"One customer reduced their sales cycle by 40% with proof-ranked case studies."' }
      ],
      nextActions: [
        { action: 'Replace current landing page hero with £40K savings proof quote', impact: 'High', effort: 'Low', source: 'Growth Recommendation' },
        { action: 'Build SDR outbound sequence around top 3 ranked trust signals', impact: 'High', effort: 'Medium', source: 'Growth Recommendation' },
        { action: 'Publish founder LinkedIn post featuring 12 hours/week time savings proof', impact: 'Medium', effort: 'Low', source: 'Growth Recommendation' },
        { action: 'Create case study bundle from top 3 signals for sales enablement', impact: 'Medium', effort: 'Medium', source: 'Scaile' }
      ],
      growthLoops: [
        'Customer proof → LinkedIn content → inbound leads → more proof',
        'SDR deck with ranked signals → faster deals → new testimonials',
        'Case study library → SEO → demo requests → proof discovery'
      ],
      conversionFramework: [
        'Awareness: Lead with strongest financial proof',
        'Consideration: Stack 3 trust signals by persona',
        'Decision: Deploy case study + ROI calculator',
        'Expansion: Surface new proof from success calls'
      ],
      playbook: 'Start every outbound sequence with your #1 ranked trust signal. Match proof type to buyer persona: CFO gets financial impact, VP Ops gets time savings, CEO gets growth metrics.'
    }
  },
  {
    title: 'Landing Page Proof Architecture',
    type: 'conversion',
    content: {
      icp: 'Website visitors from paid and organic channels needing immediate trust',
      positioning: 'Every visitor sees your strongest proof first — dynamically ranked by conversion potential and matched to their buying stage.',
      outreachSystem: [
        'Hero: Top financial proof signal with specific number',
        'Social proof bar: 3 highest-scored trust signals',
        'Feature sections: Map proof to product capabilities',
        'CTA: Use conversion-optimized proof in button context'
      ],
      contentIdeas: [
        { title: 'The ROI of Proof-Led Landing Pages: A Case Study in Conversion', format: 'Data Story', angle: 'Show 34% conversion lift with before/after' },
        { title: 'Why Enterprise Buyers Trust Customer Proof Over Your Product Team', format: 'LinkedIn Article', angle: 'Trust economics for B2B' },
        { title: 'How We Found 47 Trust Signals in 2 Years of Support Tickets', format: 'Behind the Scenes', angle: 'Process transparency builds trust' }
      ],
      landingPageAngles: [
        { headline: 'Your Strongest Proof. First. Always.', hook: 'One quote moved conversion 34%. What\'s hiding in your customer data?', proofQuote: '"Conversion on our landing page jumped 34% with a single ROI quote."' },
        { headline: 'Stop Guessing What Converts. Start Knowing.', hook: 'Ranked trust signals tell you exactly which proof to feature.', proofQuote: '"We uncovered £2.3M in quantified outcomes from customer emails alone."' }
      ],
      nextActions: [
        { action: 'A/B test top 3 proof signals on landing page hero', impact: 'High', effort: 'Low', source: 'Scaile' },
        { action: 'Add social proof bar with 3 highest-scored trust signals', impact: 'Medium', effort: 'Low', source: 'Growth Recommendation' }
      ],
      growthLoops: [
        'A/B test proof signals → measure conversion → re-rank automatically',
        'New customer data → auto-update hero proof → improved CVR'
      ],
      conversionFramework: [
        'Above fold: Single strongest proof (score 90+)',
        'Mid-page: Emotional + rational proof pairing',
        'Bottom: Risk reduction + competitive advantage signals'
      ],
      playbook: 'Replace generic value props with ranked customer proof. Test top 3 signals weekly. Financial proof converts best for bottom-funnel; emotional proof for top-funnel.'
    }
  }
];

export const DEMO_CONTENT_ASSETS: ContentAssetResult[] = [
  {
    type: 'linkedin',
    title: 'Founder LinkedIn Post — ROI Proof',
    platform: 'LinkedIn',
    content: `Most startups don't have a marketing problem.

They have a proof problem.

One of our customers saved £40,000 in 3 months.

Not from a case study we wrote.
From an email buried in their inbox.

That's what ProofLoop does — discovers the proof you already have and turns it into your growth engine.

What's the strongest proof your customers have given you? 👇`
  },
  {
    type: 'email',
    title: 'Proof-Led Email Campaign',
    platform: 'Email',
    content: `Subject: How [Company] saved 12 hours/week (real customer data)

Hi {{first_name}},

Quick story — a recruitment agency like yours told us:

"Our recruiters now save 12 hours per week on manual screening."

They didn't write us a testimonial. We found it in a support ticket.

That's the power of proof-led GTM — using evidence, not adjectives.

Want to see what proof is hiding in your customer data?

[Book a 15-min demo →]`
  },
  {
    type: 'case_study',
    title: 'Case Study — TalentFlow ROI Story',
    platform: 'Website',
    content: `# How TalentFlow Saved £40,000 in 3 Months

## Challenge
TalentFlow's VP Operations struggled to quantify product value for enterprise prospects. Marketing was generic. Sales cycles stretched to 90+ days.

## Proof Discovered
ProofLoop surfaced a buried customer email: "We saved £40,000 in operational costs after using your platform for just 3 months."

## Results
- 34% landing page conversion lift
- 40% shorter sales cycles
- 95% team adoption in week one

## Key Trust Signal
Revenue Savings | Financial Impact | Proof Score: 96/100`
  },
  {
    type: 'landing_page',
    title: 'Landing Page Hero Copy',
    platform: 'Website',
    content: `# Turn hidden customer proof into your growth engine

> "We saved £40,000 in operational costs in just 3 months."

Discover, rank, and amplify the proof your customers already give you — from emails, reviews, calls, and support tickets.

[Start discovering proof →]`
  }
];

export const DEMO_GROWTH_RECOMMENDATIONS: GrowthRecommendationResult[] = [
  {
    title: 'Scale Financial Proof on Landing Page Hero',
    description:
      'Your £40K savings signal scores 96/100 with 95% conversion potential. Deploy immediately as hero copy.',
    priority: 'high',
    impact: 95,
    effort: 15,
    category: 'Conversion Optimization',
    proofSignalIds: [],
    actionItems: [
      'Replace current hero with £40K proof quote',
      'A/B test against 12 hours/week time savings signal',
      'Add proof score badge for credibility'
    ]
  },
  {
    title: 'Launch Recruitment ICP Outbound Campaign',
    description:
      'Time savings proof resonates 92% with recruitment agencies. Build targeted outbound using ranked signals.',
    priority: 'high',
    impact: 88,
    effort: 35,
    category: 'Outbound GTM',
    proofSignalIds: [],
    actionItems: [
      'Create SDR deck with top 5 ranked signals',
      'Segment list to recruitment agencies 50-500 employees',
      'Lead with 12 hours/week proof in first touch'
    ]
  },
  {
    title: 'Publish Founder LinkedIn Proof Series',
    description:
      'Emotional burnout proof scores 96% emotional impact. Ideal for founder-led content strategy.',
    priority: 'medium',
    impact: 76,
    effort: 25,
    category: 'Content Amplification',
    proofSignalIds: [],
    actionItems: [
      'Schedule 4-week LinkedIn proof series',
      'Lead with emotional proof, close with financial proof',
      'Track engagement by signal type'
    ]
  },
  {
    title: 'Build Case Study Library from Top 3 Signals',
    description:
      'Three signals score 90+ proof score. Package into downloadable case studies for sales enablement.',
    priority: 'medium',
    impact: 82,
    effort: 40,
    category: 'Sales Enablement',
    proofSignalIds: [],
    actionItems: [
      'Generate case studies for top 3 signals',
      'Add to sales deck and CRM',
      'Track deal influence attribution'
    ]
  }
];

export const DEMO_ANALYTICS = {
  overview: {
    totalProofSources: 12,
    trustSignalsFound: 47,
    avgProofScore: 87,
    assetsGenerated: 23,
    conversionLift: 34
  },
  proofByCategory: [
    { category: 'Financial Impact', count: 12, avgScore: 93 },
    { category: 'Efficiency', count: 10, avgScore: 88 },
    { category: 'Growth', count: 8, avgScore: 85 },
    { category: 'Emotional Impact', count: 7, avgScore: 82 },
    { category: 'Sales Enablement', count: 6, avgScore: 86 },
    { category: 'Product Adoption', count: 4, avgScore: 79 }
  ],
  conversionBySignal: [
    { signal: 'Revenue Savings', rate: 95 },
    { signal: 'Time Savings', rate: 89 },
    { signal: 'Growth Improvement', rate: 87 },
    { signal: 'Risk Reduction', rate: 84 },
    { signal: 'Customer Satisfaction', rate: 82 }
  ],
  timeline: [
    { date: '2026-01', sources: 2, signals: 8, assets: 3 },
    { date: '2026-02', sources: 4, signals: 18, assets: 8 },
    { date: '2026-03', sources: 7, signals: 31, assets: 14 },
    { date: '2026-04', sources: 9, signals: 39, assets: 18 },
    { date: '2026-05', sources: 11, signals: 44, assets: 21 },
    { date: '2026-06', sources: 12, signals: 47, assets: 23 }
  ]
};
