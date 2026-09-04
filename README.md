# Accelerando

Guided listening for classical music: AI-annotated timelines synced to YouTube
recordings, then reasoned recommendations from your reflections.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (anonymous auth, RLS, persistence)
- Gemini or Anthropic for annotations + recommendations
- YouTube IFrame API for playback
- Open Opus catalog (`data/catalog.json`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env template and fill in values:

```bash
cp .env.example .env.local
```

3. In Supabase → SQL Editor, run `supabase/migrations/001_initial.sql`.

4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/publishable key |
| `GEMINI_API_KEY` | One of Gemini/Anthropic | Google AI annotations + recommendations |
| `ANTHROPIC_API_KEY` | One of Gemini/Anthropic | Claude annotations + recommendations |
| `ANNOTATION_PROVIDER` | No | Force `gemini` or `anthropic` |
| `GEMINI_MODEL` | No | Override Gemini model (default `gemini-3.5-flash-lite`) |
| `ANTHROPIC_MODEL` | No | Override Anthropic model id |

## App routes

- `/` — featured starters + continue listening
- `/library` — Open Opus browse/search (server-backed)
- `/piece/[pieceId]` — catalog work detail
- `/listen/[pieceId]` — player, annotations, reflection, recommend
- `/history` — session timeline
- `/about` — how to use the app

## Notes

- Annotation timestamps are relative to a specific YouTube recording, not a generic score timeline.
- Shared annotation responses are cached under `data/annotation-cache/` (gitignored).
- AI routes require a Bearer JWT from anonymous Supabase auth and are rate-limited per user + IP.
