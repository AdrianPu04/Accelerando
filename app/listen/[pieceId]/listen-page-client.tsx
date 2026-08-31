"use client";

import { useEffect } from "react";

import { AnnotationCard } from "@/components/annotation-card";
import { AnnotationTimeline } from "@/components/annotation-timeline";
import { AudioPlayer } from "@/components/audio-player";
import { PlaybackControls } from "@/components/playback-controls";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { getAnnotationsForPiece } from "@/lib/fake-annotations";
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
  const annotations = getAnnotationsForPiece(piece.id);

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

      <AnnotationCard annotations={annotations} />

      <AnnotationTimeline
        annotations={annotations}
        currentTime={player.currentTime}
        duration={player.duration}
        onSeek={player.seekTo}
      />

      <PlaybackControls
        isReady={player.isReady}
        isPlaying={player.isPlaying}
        onPlay={player.play}
        onPause={player.pause}
      />
    </div>
  );
}
