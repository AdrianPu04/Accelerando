"use client";

import { useEffect } from "react";

import { AnnotationCard } from "@/components/annotation-card";
import { AnnotationTimeline } from "@/components/annotation-timeline";
import { AudioPlayer } from "@/components/audio-player";
import { PlaybackControls } from "@/components/playback-controls";
import { Button } from "@/components/ui/button";
import { useAnnotations } from "@/hooks/use-annotations";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { startPieceSession } from "@/lib/player";
import type { Piece } from "@/types";

interface ListenPageClientProps {
  piece: Piece;
}

export function ListenPageClient({ piece }: ListenPageClientProps) {
  useEffect(() => {
    startPieceSession(piece.id);
  }, [piece.id]);

  const player = useAudioPlayer(piece);
  const {
    data: annotations = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useAnnotations(piece.id);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
      <header className="space-y-1">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {piece.era}
        </p>
        <h1 className="font-heading text-3xl font-semibold">{piece.title}</h1>
        <p className="text-muted-foreground">
          {piece.composer}
          {piece.movement ? ` · ${piece.movement}` : null}
        </p>
      </header>

      <AudioPlayer containerRef={player.containerRef} isReady={player.isReady} />

      {isPending && isFetching ? (
        <p className="text-sm text-muted-foreground">
          Generating annotations…
        </p>
      ) : null}

      {isError ? (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Could not generate annotations."}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {!isPending && !isError && annotations.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground">
            Annotations are generated from musical knowledge of this work, not
            by analyzing the recording.
          </p>

          <AnnotationCard annotations={annotations} />

          <AnnotationTimeline
            annotations={annotations}
            currentTime={player.currentTime}
            duration={player.duration}
            onSeek={player.seekTo}
          />
        </>
      ) : null}

      <PlaybackControls
        isReady={player.isReady}
        isPlaying={player.isPlaying}
        onPlay={player.play}
        onPause={player.pause}
      />
    </div>
  );
}
