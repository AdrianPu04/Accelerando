import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Accelerando works — guided listening, reflections, and reasoned recommendations.",
};

const STEPS = [
  {
    title: "Choose a recording",
    body: "Start from the home starters, or browse the library for a playable work. Each listening session is tied to one specific YouTube recording.",
  },
  {
    title: "Follow the timeline",
    body: "As the music plays, annotations appear at structural landmarks — themes, turns, climaxes, and textures worth noticing. Scrub the timeline or keep listening straight through.",
  },
  {
    title: "Reflect",
    body: "When you finish (or nearly finish), write a short reflection about what stood out. Your words matter more than a rating.",
  },
  {
    title: "Get a reasoned next listen",
    body: "Accelerando suggests another piece and explains why, based on your reflection and the annotations — not a silent playlist shuffle.",
  },
] as const;

export default function AboutPage() {
  return (
    <AppShell>
      <header className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          About
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance">
          AI explains. You listen, reflect, and choose.
        </h1>
        <p className="text-muted-foreground">
          Accelerando is a guided listening companion for classical music —
          annotated timelines synced to recordings, then recommendations that
          show their reasoning.
        </p>
      </header>

      <div className="grid gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
        <section className="space-y-8">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            How to use it
          </h2>
          <ol className="divide-y divide-border border-y border-border">
            {STEPS.map((step, index) => (
              <li key={step.title} className="grid gap-3 py-6 sm:grid-cols-[3rem_minmax(0,1fr)]">
                <span className="font-heading text-2xl font-semibold tracking-tight text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-10 lg:sticky lg:top-8">
          <section className="space-y-3 border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              About the notes
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Annotations come from musical knowledge of the work — form,
              themes, orchestration — not from analyzing the audio waveform of
              your specific recording. Timestamps are matched to the attached
              YouTube performance as best as possible.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6 lg:border-t-0 lg:pl-8">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Your history
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sessions, reflections, and recommendations are saved to your
              account so you can revisit the chain of listening choices over
              time.
            </p>
            <p className="pt-2">
              <Link
                href="/history"
                className="text-xs font-semibold tracking-widest uppercase underline-offset-4 hover:underline"
              >
                Open history
              </Link>
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6 lg:border-t-0 lg:pl-8">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Ready to begin
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pick a featured recording on the home page, or browse the full
              catalog.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
              <Link
                href="/"
                className="text-xs font-semibold tracking-widest uppercase underline-offset-4 hover:underline"
              >
                Start here
              </Link>
              <Link
                href="/library"
                className="text-xs font-semibold tracking-widest uppercase underline-offset-4 hover:underline"
              >
                Browse library
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
