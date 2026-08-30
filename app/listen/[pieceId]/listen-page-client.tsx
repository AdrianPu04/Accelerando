"use client";

import { useEffect } from "react";

import { AudioPlayer } from "@/components/audio-player";
import { PlaybackControls } from "@/components/playback-controls";
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

      <PlaybackControls
        isReady={player.isReady}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        onPlay={player.play}
        onPause={player.pause}
        onSeek={player.seekTo}
      />
    </div>
  );
}
