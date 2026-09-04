# Accelerando

A guided listening companion for classical music.

Listen to a YouTube recording with an AI-annotated timeline, write a short
reflection, then get a **reasoned** recommendation for what to hear next —
not a silent playlist shuffle.

**Philosophy:** AI explains; you listen, reflect, and choose.

## How it works

1. **Choose a recording** — Home “Start here” starters, or browse the Open Opus library for a playable work.
2. **Follow the timeline** — Notes appear at structural landmarks as the piece plays. You can scrub or listen straight through.
3. **Reflect** — After listening, write what stood out.
4. **Get a next listen** — The app streams a recommendation with reasoning grounded in your reflection and the annotations.

Annotations are generated from **musical knowledge of the work** (form, themes, orchestration), **not** from analyzing the audio waveform of your specific recording. Timestamps are aligned to the attached YouTube performance as well as possible.

## Stack

- **Next.js 16** (App Router) + TypeScript + React 19
- **Tailwind CSS 4** + shadcn/ui
- **Supabase** — anonymous auth, RLS, persistence (sessions, reflections, recommendations, annotation edits)
- **Gemini** (default) or **Anthropic** — annotations + streamed recommendations
- **YouTube IFrame API** — playback (no self-hosted audio)
- **Open Opus** catalog in `data/catalog.json` (~811 works, ~782 with YouTube attachments)
- **Zustand** + **TanStack Query** — player state and annotation fetching

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env template and fill in values:

```bash
cp .env.example .env.local
```

3. In the Supabase dashboard → **SQL Editor**, run both migrations in order:
   - [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql)
   - [`supabase/migrations/002_ai_cache_and_rate_limits.sql`](supabase/migrations/002_ai_cache_and_rate_limits.sql)

4. Add `SUPABASE_SERVICE_ROLE_KEY` from Supabase → **Settings → API** (server-only; never expose to the client).

5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve production build
```

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | Durable shared annotation cache + rate limits (server only) |
| `GEMINI_API_KEY` | One of Gemini / Anthropic | Google AI for annotations + recommendations |
| `ANTHROPIC_API_KEY` | One of Gemini / Anthropic | Claude for annotations + recommendations |
| `ANNOTATION_PROVIDER` | No | Force `gemini` or `anthropic` |
| `GEMINI_MODEL` | No | Override Gemini model (default `gemini-3.5-flash-lite`) |
| `ANTHROPIC_MODEL` | No | Override Anthropic model id |

## App routes

| Route | Purpose |
|---|---|
| `/` | Featured starters, continue listening, recent recommendations |
| `/library` | Search / filter the Open Opus catalog (server-backed) |
| `/piece/[pieceId]` | Catalog work detail + listen CTA when playable |
| `/listen/[pieceId]` | Player, annotations, reflection, streamed recommendation |
| `/history` | Chronological sessions, reflections, and recommendations |
| `/about` | How to use the app |

### API

| Route | Purpose |
|---|---|
| `POST /api/generate-annotations` | Auth’d annotation generation (shared cache + rate limits) |
| `POST /api/recommend-next` | Auth’d NDJSON stream: selected piece, then reasoning |
| `GET /api/pieces/[pieceId]` | Public piece metadata (keeps catalog off the client bundle) |
| `GET /api/catalog/search` | Paginated catalog search / filters |

## Notable details

- **Catalog is server-only** — `data/catalog.json` is not shipped to the client; the library and piece lookups go through the server / APIs.
- **YouTube embeds** avoid hosting or licensing recordings yourself. Each playable catalog work maps to one attached video; annotation times are relative to that recording.
- **Shared annotation cache** — generated notes are stored in Supabase (`shared_annotation_cache`) and reused across users for the same recording fingerprint. Requires `SUPABASE_SERVICE_ROLE_KEY`.
- **AI routes** require a Bearer JWT from anonymous Supabase auth and are rate-limited per user **and** IP via durable Supabase buckets (with an in-memory fallback if the service role is unset).
- **Long works** — annotation density is capped (guided window + max note count) to keep generation reliable and affordable.
- **Recommendations** sample a diversified candidate pool across eras/composers and exclude pieces the user has already listened to.

## Home starters

Featured on `/` (catalog ids in `lib/pieces.ts`):

- Beethoven — Symphony No. 7  
- Bach — Brandenburg Concerto No. 3  
- Gershwin — Rhapsody in Blue  
- Elgar — Cello Concerto  
- Mozart — Symphony No. 40  

## Tests

Playwright e2e covers home/about/library smoke paths and the listen loop
(annotations → reflection → recommendation). Supabase auth/REST, YouTube IFrame
API, and AI routes are mocked in `e2e/fixtures.ts`, so a live Supabase project
or AI keys are not required for the browser tests.

```bash
npx playwright install chromium   # once
npm run test:e2e                  # builds + serves on port 3173, then runs tests
npm run test:e2e:ui               # interactive Playwright UI
```

The suite uses `next build` + `next start` (not `next dev`) so static chunks load
reliably under Chromium.
