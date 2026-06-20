# Unify GTM — Reference for Claude Code

> Context doc for working with the Unify GTM platform and its APIs.
> Source: https://www.unifygtm.com/ and https://docs.unifygtm.com (fetched 2026-06-20).

## What Unify is

Unify is a B2B outbound go-to-market (GTM) platform — an "outbound system of
action." It unifies three layers that normally live in separate tools:

1. **Intent data** — capturing buying signals (web traffic, product usage, job
   changes, champion tracking, and other "Signals").
2. **AI agents** — always-on research that monitors your TAM, qualifies
   accounts, and personalizes outreach at scale.
3. **Outbound action** — multi-channel sequencing, AI personalization, and
   managed email deliverability.

Core product surfaces: **Signals** (25+ intent sources), **B2B Contact Data**
(enrichment), **Plays** (orchestration workflows bridging data → action),
**Sequences** (outreach), **AI Agents**, and **Analytics**. Backed by a $6.6M
Series A led by OpenAI, Thrive, and Emergence. Customers include Perplexity,
Cursor, and Together AI.

The platform is built to be open and developer-friendly: data is the foundation,
and the APIs let you connect custom data sources, import from external tools, and
export to other systems.

---

## The two APIs

Unify exposes **two separate APIs on two different domains**. Do not confuse them —
they use different base URLs and different authentication.

| | Data API | Analytics API |
|---|---|---|
| **Purpose** | Read/write the data platform (objects, attributes, records) | Ingest behavioral/intent events |
| **Base URL** | `https://api.unifygtm.com/data/v1` | `https://api.unifyintent.com/analytics/v1` |
| **Auth header** | `X-Api-Key: <token>` | `X-Write-Key: <token>` |
| **Key type** | Secret API key — **server-side only, never expose** | Write key — **safe to expose publicly** |
| **Extra requirement** | — | Must send an allowed `Origin` header |
| **Rate limit** | 100,000 requests / 5-minute window | 100,000 requests / 5-minute window (higher on request) |
| **Status** | Public beta | Stable |
| **OpenAPI spec** | `https://api.unifygtm.com/data/v1/openapi.json` | `https://api.unifyintent.com/analytics/v1/openapi.json` |

### Security note
If a real **API key** is accidentally sent to the **Analytics API**, Unify
immediately **expires the key** as a precaution. The Analytics endpoint expects a
write key only. Keep the two key types strictly separated in code and env vars.

---

## Data API — what it does

Manages and moves structured data in and out of Unify. Data model:

- **Objects** — the building blocks (e.g. `company`, `person`, `opportunity`).
- **Attributes** — the fields/schema on an object (e.g. `email`, `title`).
- **Records** — instances of an object (an actual person, company, etc.).

API groups (all REST, standard HTTP verbs for CRUD):

- **Object APIs** — create/manage object definitions and schemas.
- **Attribute APIs** — create/manage attributes on objects, plus attribute options.
- **Record APIs** — create, get, update, delete, **find-unique**, and **upsert** records.
- **Bulk API** — export large datasets out of Unify.

Use it to: connect custom data sources, import records from external tools, sync
data bidirectionally, and export data to other systems.

### Authentication
Generate an API key in Unify: **Settings → Developers**. Send it as a header:

```http
X-Api-Key: <token>
```

### Official SDKs (server-side)
- **TypeScript:** `@unifygtm/sdk` — https://github.com/unifygtm/sdk-typescript
- **Python:** official Unify Python library (see docs `/developers/sdks/python-library`)

The TypeScript SDK reads `UNIFY_API_KEY` from the environment by default.

```typescript
import Unify from '@unifygtm/sdk';

const client = new Unify({ apiKey: process.env['UNIFY_API_KEY'] }); // apiKey optional if env var set

// List objects in the workspace
const objects = await client.data.objects.list();

// Inspect an object's schema
const attributes = await client.data.attributes.list('person');

// Upsert — create or update by a unique match key (recommended for syncing; auto-dedupes)
const record = await client.data.records.upsert('person', {
  match: { email: 'jane@acme.com' },
  create_or_update: {
    email: 'jane@acme.com',
    first_name: 'Jane',
    last_name: 'Smith',
    title: 'Head of Growth',
    company: {
      match: { domain: 'acme.com' },
      create_or_update_if_empty: { domain: 'acme.com', name: 'Acme Corp' },
    },
  },
});

// Look up by unique attribute without knowing the record ID
const found = await client.data.records.findUnique('person', {
  match: { email: 'jane@acme.com' },
});
```

**Prefer `upsert`** for syncing data in — it deduplicates on the match key
instead of creating duplicate records.

---

## Analytics API — what it does

Sends client-side or server-side events into Unify to track visitor and product
behavior. Three event types:

- **Page events** — page visits on a website or web app.
- **Custom events** — actions/activities you define.
- **Identify events** — associate a visitor with identity info (e.g. email).

These are the building blocks for intent tracking that downstream Signals, Plays,
and AI agents act on.

### Authentication
Find your write key in Unify: **Settings → Web & product data → Settings**. Send
it as a header, and include a valid `Origin`:

```http
X-Write-Key: <token>
Origin: https://yourdomain.com
```

For server-side requests, set `Origin` to the website/app origin the event
belongs to.

### Intent Client SDK (browser)
For client-side integrations, use the **Unify Intent Client** rather than calling
the API by hand:
- JS package for frontend frameworks
- React package
- Website tag (for marketing sites, installable via Google Tag Manager)

Captures page views, button clicks, form fills, and user logins.

---

## Getting data into Unify — the four paths

When deciding how to integrate, Unify documents four approaches:

1. **Connect website traffic** — Intent Client / website tag → Analytics API.
2. **Connect product usage data** — Intent Client SDK → Analytics API.
3. **Connect data systems** — databases / warehouses / lakes via reverse-ETL
   tools (Fivetran, Hightouch) → Data API.
4. **Send data via API** — webhooks/APIs (incl. Clay sheets, CSV import) → Data API.

---

## Quick decision guide

- Tracking what visitors/users **do** (pageviews, clicks, identify)? → **Analytics
  API** + write key (`X-Write-Key`), or the Intent Client SDK in the browser.
- Reading/writing **records, objects, or schema**, or syncing/exporting data? →
  **Data API** + secret API key (`X-Api-Key`), server-side only.
- Building in TS or Python? → use the official SDK, don't hand-roll requests.
- Never put a Data API key anywhere client-side or in an Analytics request.

---

## Key links

- Site: https://www.unifygtm.com/
- Developer docs: https://docs.unifygtm.com/developers/introduction
- Data API: https://docs.unifygtm.com/developers/api/data/overview
- Analytics API: https://docs.unifygtm.com/developers/api/analytics/overview
- LLM doc index: https://docs.unifygtm.com/llms.txt
- TS SDK repo: https://github.com/unifygtm/sdk-typescript
