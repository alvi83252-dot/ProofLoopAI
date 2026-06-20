# Auto-GTM Generator

## Overview

The Auto-GTM Generator transforms ProofLoop's discovered trust signals into a complete Go-To-Market system. It takes your top-ranked customer proof and generates ICP, positioning, outreach sequences, content ideas, landing page angles, and prioritized next actions — all in one click.

Instead of manually sorting through testimonials and guessing which proof to use, the generator reads your highest-scored trust signals and produces a structured, actionable GTM playbook tailored to your strongest customer evidence.

## How It Works

The generator is currently **deterministic** — it maps signal types and categories to industry verticals, positions, and content angles using pattern matching (e.g., `"Revenue Savings"` → `"ROI-focused enterprises"`). This provides consistent, demo-quality output without external dependencies. The architecture supports swapping this with AI prompts later: the `generateGtmSystem()` function in `sponsors.ts` already checks for `GTMENGINEER_API_KEY` before falling back to the deterministic path.

```
Trust Signals (ranked by proofScore)
        │
        ▼
  Top 3 Signals
        │
        ├──► generateGtmSystem() ──► ICP, Positioning, Outreach,
        │                              Content Ideas, Landing Angles,
        │                              Growth Loops, Conversion Framework
        │
        ├──► getGrowthRecommendations() ──► Next Actions (ranked by impact/effort)
        │       (calls SCAILE when API key is set)
        │
        ▼
  Complete GTM Playbook
        │
        ├──► Saved to in-memory store (persists during session)
        ├──► Displayed on /gtm page with metrics
        └──► Users submit feedback → updates future recommendations
```

## API Endpoints

### `GET /api/gtm-playbooks`

Returns all stored playbooks and aggregated metrics.

**Response:**
```json
{
  "playbooks": [
    {
      "id": "playbook-1",
      "title": "Proof-Led Outbound for Recruitment ICP",
      "type": "outreach",
      "content": { "...": "..." },
      "feedback": []
    }
  ],
  "metrics": {
    "playbooksGenerated": 1,
    "feedbackSubmitted": 0,
    "helpfulCount": 0,
    "notHelpfulCount": 0,
    "topPerformingSignals": {}
  }
}
```

### `POST /api/gtm/generate`

Generates a new GTM system from the top 3 trust signals.

**Request:** (empty body)

**Response:**
```json
{
  "playbook": {
    "id": "uuid",
    "title": "GTM System: Revenue Savings + Time Savings + Growth Improvement",
    "type": "outreach",
    "content": {
      "icp": "ROI-focused enterprises with 50-500 employees...",
      "positioning": "We help [target] turn hidden customer outcomes into...",
      "outreachSystem": [
        "Touch 1 — Revenue Savings: \"We saved £40,000...\"",
        "Touch 2 — Time Savings: \"Recruiters save 12 hours/week...\"",
        "Touch 3 — Growth Improvement: \"Conversion jumped 34%...\"",
        "Touch 4 — Close with a case study bundling all 3 signals"
      ],
      "contentIdeas": [
        { "title": "...", "format": "Case Study", "angle": "..." }
      ],
      "landingPageAngles": [
        { "headline": "...", "hook": "...", "proofQuote": "..." }
      ],
      "nextActions": [
        { "action": "...", "impact": "High", "effort": "Low", "source": "Scaile" }
      ],
      "growthLoops": ["..."],
      "conversionFramework": ["..."],
      "playbook": "Start every sequence with your #1 ranked trust signal..."
    },
    "feedback": []
  },
  "signalsUsed": [
    { "id": "signal-1", "quote": "...", "proofScore": 96, "signalType": "Revenue Savings" }
  ],
  "metrics": {
    "playbooksGenerated": 1,
    "feedbackSubmitted": 0,
    "helpfulCount": 0,
    "notHelpfulCount": 0
  },
  "poweredBy": "demo" | "scaile"
}
```

### `POST /api/gtm/feedback`

Submit feedback on a generated playbook. Feedback is stored on both the global metrics and the individual playbook record.

**Request:**
```json
{
  "playbookId": "uuid",
  "rating": "helpful" | "not_helpful",
  "comment": "Optional comment"
}
```

**Response:**
```json
{
  "feedback": {
    "id": "uuid",
    "playbookId": "uuid",
    "rating": "helpful",
    "comment": "Optional comment",
    "createdAt": "2026-06-20T12:00:00.000Z"
  },
  "metrics": {
    "playbooksGenerated": 1,
    "feedbackSubmitted": 1,
    "helpfulCount": 1,
    "notHelpfulCount": 0,
    "topPerformingSignals": {}
  }
}
```

### `GET /api/gtm/metrics`

Returns aggregated metrics:
- `playbooksGenerated` — total playbooks created (incremented each time `/api/gtm/generate` is called)
- `feedbackSubmitted` — total feedback entries across all playbooks
- `helpfulCount` — count of `"helpful"` ratings
- `notHelpfulCount` — count of `"not_helpful"` ratings
- `topPerformingSignals` — signal IDs mapped to usage count (reserved for future ranking)

## UI: GTM Page (`/gtm`)

The page at `apps/web/src/app/gtm/page.tsx` displays:

### Metrics Dashboard
Four cards showing: Playbooks Generated, Marked Helpful, Marked Not Helpful, Total Feedback

### Top 3 Signals Used Panel
Appears after generation, showing which signals were selected with their proof scores, signal types, and quotes.

### Playbook Cards
Each generated playbook displays:
- **Title + Type badge**
- **Helpful / Not Helpful buttons** per playbook
- **Ideal Customer Profile** — who to target
- **Positioning** — market positioning statement
- **Outreach Sequence** — 4 numbered touches with specific proof quotes
- **Content Ideas** — cards with title, format badge, and angle description
- **Landing Page Angles** — headline, hook, and proof quote blockquotes
- **Next Actions** — each with Impact badge (High/Medium/Low) and Effort badge (Low/Medium/High) and source label
- **Growth Loops** — list of compounding growth mechanics
- **Conversion Framework** — staged buyer journey mapping
- **Playbook Narrative** — written execution summary
- **Feedback summary** — helpful vs not-helpful counts per playbook

### Empty State
When no playbooks exist, a dashed-border card prompts the user to generate their first playbook.

## SCAILE Integration

### What SCAILE Is

SCAILE is an AI-powered GTM intelligence platform that provides:
- Social listening (Reddit, LinkedIn, forums, web conversations)
- Competitor intelligence
- Customer intent analysis
- AI visibility / AEO tracking
- Content opportunity discovery
- Sentiment tracking
- Market trend detection
- GTM workflow automation

### Why SCAILE Matters for This Feature

The Auto-GTM Generator is built around a feedback loop between **your proof** (trust signals) and **market intelligence** (SCAILE):

1. **From static to dynamic** — Without SCAILE, the generator produces good GTM playbooks based on your signals. With SCAILE, those playbooks are ranked by what's happening in the market *right now*.

2. **Action prioritization** — SCAILE's recommendation engine evaluates which GTM actions will have the highest impact given current market conditions, competitor activity, and customer intent signals.

3. **Live data drives decisions** — The generator integrates SCAILE via `getGrowthRecommendations()` in `apps/api/src/integrations/sponsors.ts`:
   - When `SCAILE_API_KEY` and `SCAILE_API_URL` are set in `.env`, the generator POSTs your top signals to SCAILE's recommendation endpoint
   - SCAILE returns ranked recommendations with priority, impact score, effort score, and action items
   - These become the **Next Actions** section of your playbook, tagged with `source: "Scaile"`
   - The UI shows Scaile-powered actions with a distinct badge

4. **Demo fallback** — Without SCAILE keys, the generator uses built-in demo recommendations from `DEMO_GROWTH_RECOMMENDATIONS`. The `poweredBy` field in API responses indicates which mode is active (`"scaile"` or `"demo"`).

### Data Flow

```
Your Trust Signals
       │
       ▼
  POST /recommendations  ──►  SCAILE API
       │                          │
       │                    Market analysis
       │                    Competitor tracking
       │                    Intent scoring
       │                          │
       ▼                          ▼
  GrowthRecommendationResult[]  ──►  Ranked actions with
       │                              priority, impact, effort
       ▼
  GTM Playbook Next Actions
  (sorted by impact, tagged "Scaile")
```

## Files Changed

| File | Changes |
|---|---|
| `apps/api/src/data/demo.ts` | Extended `GtmPlaybookContent` with positioning, contentIdeas, landingPageAngles, nextActions. Updated demo playbooks with full content. |
| `apps/api/src/integrations/sponsors.ts` | Rewrote `generateGtmSystem()` to dynamically generate playbooks from top 3 signals. SCAILE integration in `getGrowthRecommendations()`. |
| `apps/api/src/store/memory.ts` | Added `FeedbackEntry`, `GtmMetrics`, `addPlaybook()`, `addFeedback()`, `getGtmMetrics()`. Extended Store with feedback array and metrics. |
| `apps/api/src/routes/index.ts` | Added 3 new endpoints: `/api/gtm/generate`, `/api/gtm/feedback`, `/api/gtm/metrics`. Updated `/api/gtm-playbooks` to include metrics. Updated `/api/gtmengineer/generate` to persist playbooks. |
| `apps/web/src/lib/api.ts` | Added 3 new API methods: `generateGtmFromSignals()`, `submitGtmFeedback()`, `getGtmMetrics()`. Updated `getGtmPlaybooks()` return type. |
| `apps/web/src/app/gtm/page.tsx` | Complete rewrite with metrics dashboard, signals panel, full playbook rendering (ICP, positioning, outreach, content ideas, landing angles, next actions, growth loops, conversion framework), feedback buttons, feedback counts, empty state. |

## To Connect SCAILE Live

Set these environment variables in `apps/api/.env`:

```env
SCAILE_API_KEY=your_scaile_api_key
SCAILE_API_URL=https://your-scaile-instance.com
```

Restart the API. The next `POST /api/gtm/generate` call will route through SCAILE's recommendation engine and return `poweredBy: "scaile"`.
