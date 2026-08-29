# Guided Listening Companion — Step-by-Step Build Plan

A classical music app that pairs **guided listening** (AI-annotated timeline synced to a recording) with a **reasoned recommender** (AI suggests what to listen to next, explaining why, based on your reflections and listening history). AI analyzes and explains — the human still listens, reflects, and chooses.

---

## Tech Stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS + shadcn/ui**
- **Zustand** — player state, active annotation tracking
- **TanStack Query** — fetching/caching AI-generated annotations and recommendations
- **Claude API (structured output + streaming)** — annotation generation (structured) and recommendation reasoning (streamed)
- **Framer Motion** — timeline/annotation transitions
- **Supabase** *(optional)* — persistence for listening history and reflections, or IndexedDB/localStorage to skip a backend
- **Playwright** — e2e tests
- **YouTube IFrame API or an audio embed** — playback source (see note below)

---

## Data Model

```typescript
interface Piece {
  id: string;
  title: string;             // e.g. "Symphony No. 7 in A major, Op. 92"
  composer: string;
  movement?: string;
  era: string;                // Baroque, Classical, Romantic, etc.
  sourceUrl: string;           // YouTube/audio embed link
  durationSeconds: number;
}

interface Annotation {
  id: string;
  pieceId: string;
  timestampSeconds: number;
  label: string;              // short tag, e.g. "Main theme returns"
  note: string;                // 1-2 sentence explanation
  category: "theme" | "structure" | "orchestration" | "harmony" | "dynamics" | "other";
}

interface Reflection {
  id: string;
  pieceId: string;
  text: string;                 // freeform: "what stood out to you?"
  createdAt: string;
}

interface Recommendation {
  id: string;
  fromPieceId: string;
  toPiece: Piece;                // may be a new piece not yet in the user's library
  reasoning: string;              // streamed explanation, stored after generation
  basedOn: string[];               // annotation/reflection ids used as context
  createdAt: string;
}

interface ListeningSession {
  id: string;
  pieceId: string;
  reflectionId?: string;
  recommendationId?: string;       // the rec that came out of this session, if any
  listenedAt: string;
}
```

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Dashboard — continue listening, recent recommendations, start a new piece |
| `/listen/[pieceId]` | Player + synced annotation timeline, reflection form after listening |
| `/history` | Listening history — pieces, reflections, and the recommendation chain between them |
| `/piece/[pieceId]` | Piece detail — composer/era info, all annotations, past reflections on this piece |
| `/library` *(optional)* | Browse/search pieces to start a session with |

---

## Component Breakdown

**Listening flow (the centerpiece)**
- `AudioPlayer` — wraps YouTube IFrame API or `<audio>`, exposes current playback time
- `AnnotationTimeline` — scrubber with markers at annotation timestamps; active annotation highlights as playback passes it
- `AnnotationCard` — the note itself, animated in/out with Framer Motion as it becomes active
- `ReflectionForm` — appears after playback ends (or on a "done listening" action), freeform textarea

**Recommendation flow**
- `RecommendationReveal` — streamed text reasoning rendered progressively (not a spinner-then-dump)
- `RecommendationCard` — next piece, short reasoning summary, "start listening" CTA

**History**
- `SessionTimeline` — chronological chain: piece → reflection → recommendation → next piece
- `PieceChip` — compact piece reference used across history/dashboard

---

## Build Order

### Phase 1 — Setup
1. Scaffold the project:
   ```bash
   npx create-next-app@latest listening-companion --typescript --tailwind --app --eslint
   cd listening-companion
   npx shadcn@latest init
   npx shadcn@latest add button card textarea badge slider
   ```
2. Set up Zustand (player/annotation state) and TanStack Query provider.
3. Pick your playback source **first** — this decision shapes the player component. Simplest path: embed a YouTube recording per piece (no licensing/hosting concerns, playback API is well documented). Hosting your own audio files is possible but adds licensing complexity you don't need for a portfolio project.

### Phase 2 — Static Player + Timeline UI
4. Build `AudioPlayer` wrapping the YouTube IFrame API, exposing `currentTime` via a hook (`useAudioPlayer`).
5. Build `AnnotationTimeline` and `AnnotationCard` with **hardcoded fake annotations** for one piece — get the sync behavior and animation feel right before any AI is involved. This is the trickiest UI piece, so de-risk it early.

### Phase 3 — AI Annotation Generation
6. Build a route handler (`app/api/generate-annotations/route.ts`) that takes a piece (title, composer, movement) and returns **structured JSON** — an array of `{ timestampSeconds, label, note, category }`. Since Claude won't have heard the actual recording, prompt it for structurally well-known moments (e.g. well-documented movements) and be upfront in your README that annotations are generated from musical knowledge, not real-time audio analysis.
7. Wire real generated annotations into `AnnotationTimeline`, replacing the hardcoded set.
8. Add a lightweight review/edit affordance for annotations (even just delete/edit) — same "human stays in control" principle as your pantry app's extraction review.

### Phase 4 — Reflection
9. Build `ReflectionForm`, appearing after a listening session (e.g. triggered when playback passes 90% or the user clicks "done listening").
10. Persist reflections tied to the piece and session.

### Phase 5 — AI Recommendation
11. Build a second route handler (`app/api/recommend-next/route.ts`) that takes the piece, its annotations, and the user's reflection, and **streams back** a recommended next piece with reasoning — this is your explainable-AI showcase, so prompt it to reference specifics ("you responded to the modulation at 3:40...").
12. Build `RecommendationReveal` to render the streamed text progressively, then `RecommendationCard` once the piece itself is identified (you may want the model to emit the piece title/composer as structured data first, then stream the reasoning — worth testing both orders).
13. Wire "start listening" on the recommendation to kick off a new session at `/listen/[pieceId]`, closing the loop.

### Phase 6 — History
14. Build `/history` with `SessionTimeline` — pull sessions, reflections, and recommendations into one chronological view. This is a good Recharts/visual-timeline showcase and makes the "listening journey" concept visible.

### Phase 7 — Persistence
15. Wire everything (pieces, annotations, reflections, recommendations, sessions) to Supabase or IndexedDB, depending on whether you want cross-device persistence.

### Phase 8 — Polish
16. Mobile pass — the player and timeline need to work at phone width; test scrubbing/tap targets on an actual device.
17. Empty states (first-time user with no history), loading states for both AI calls, error handling if generation fails.
18. Framer Motion pass on annotation transitions and the recommendation reveal.

### Phase 9 — Testing & Ship
19. Playwright tests: full loop (start piece → annotations load → reflect → recommendation appears → start next piece).
20. Deploy to Vercel.
21. README: explain the YouTube embed choice, how annotations are generated (musical knowledge vs. real audio analysis — be honest about this), and the "AI explains, human chooses" philosophy.

---

## Notes & Gotchas

- **Be upfront that annotations aren't derived from analyzing the actual audio waveform** — Claude is reasoning from what it knows about the piece structurally, not "listening" to your specific recording. State this clearly in the UI or README so it reads as an honest design choice, not a bug.
- **Streamed recommendation reasoning is the standout technical piece** — don't rush it. Progressive reveal (text appearing as it's generated) is what makes this feel different from a typical recommender.
- **Keep the piece library small and curated at first** (10–20 well-known, well-documented works) rather than trying to support arbitrary pieces — this keeps annotation quality high and avoids the model guessing at obscure works.
- **Licensing**: YouTube embeds sidestep audio hosting/licensing entirely — don't self-host copyrighted recordings.