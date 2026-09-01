"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { AnnotationCard } from "@/components/annotation-card";
import { AnnotationReview } from "@/components/annotation-review";
import { AnnotationTimeline } from "@/components/annotation-timeline";
import { AudioPlayer } from "@/components/audio-player";
import { PlaybackControls } from "@/components/playback-controls";
import { RecommendationCard } from "@/components/recommendation-card";
import { RecommendationReveal } from "@/components/recommendation-reveal";
import { ReflectionForm } from "@/components/reflection-form";
import { Button } from "@/components/ui/button";
import { useAnnotations } from "@/hooks/use-annotations";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useEditableAnnotations } from "@/hooks/use-editable-annotations";
import { useListeningSession } from "@/hooks/use-listening-session";
import { useRecommendation } from "@/hooks/use-recommendation";
import { useReflectionPrompt } from "@/hooks/use-reflection-prompt";
import { clearCachedAnnotations } from "@/lib/annotation-cache";
import { startPieceSession } from "@/lib/player";
import type { Piece, Reflection } from "@/types";

interface ListenPageClientProps {
  piece: Piece;
}

export function ListenPageClient({ piece }: ListenPageClientProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    startPieceSession(piece.id);
  }, [piece.id]);

  const player = useAudioPlayer(piece);
  const { reflection, persistReflection } = useListeningSession(piece.id);
  const { isOpen: isReflectionOpen, openReflection } = useReflectionPrompt(
    player.currentTime,
    player.duration,
  );

  const {
    data: fetchedAnnotations,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useAnnotations(piece.id);

  const { annotations, updateAnnotation, deleteAnnotation } =
    useEditableAnnotations(piece.id, fetchedAnnotations);

  const {
    recommendedPiece,
    reasoning,
    isLoading: isRecommendationLoading,
    isStreaming: isRecommendationStreaming,
    isComplete: isRecommendationComplete,
    error: recommendationError,
    retry: retryRecommendation,
  } = useRecommendation(piece.id, reflection, annotations);

  const handleRegenerate = async () => {
    clearCachedAnnotations(piece.id);
    await queryClient.invalidateQueries({
      queryKey: ["annotations", piece.id],
    });
    await refetch();
  };

  const handleDoneListening = () => {
    player.pause();
    openReflection();
  };

  const handleReflectionSubmit = (nextReflection: Reflection) => {
    persistReflection(nextReflection);
  };

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

          <AnnotationReview
            annotations={annotations}
            onUpdate={updateAnnotation}
            onDelete={deleteAnnotation}
            onRegenerate={() => void handleRegenerate()}
            isRegenerating={isFetching}
          />

          <AnnotationCard annotations={annotations} />

          <AnnotationTimeline
            annotations={annotations}
            currentTime={player.currentTime}
            duration={player.duration}
            onSeek={player.seekTo}
          />
        </>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <PlaybackControls
          isReady={player.isReady}
          isPlaying={player.isPlaying}
          onPlay={player.play}
          onPause={player.pause}
        />

        {player.isReady && !isReflectionOpen && !reflection ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleDoneListening}
          >
            Done listening
          </Button>
        ) : null}
      </div>

      {isReflectionOpen || reflection ? (
        <ReflectionForm
          pieceId={piece.id}
          submittedReflection={reflection}
          onSubmit={handleReflectionSubmit}
        />
      ) : null}

      {reflection && annotations.length > 0 ? (
        <>
          {recommendedPiece ? (
            <RecommendationCard
              piece={recommendedPiece}
              reasoning={reasoning}
              isComplete={isRecommendationComplete}
            />
          ) : null}

          <RecommendationReveal
            text={reasoning}
            isLoading={isRecommendationLoading}
            isStreaming={isRecommendationStreaming}
            error={recommendationError}
          />

          {recommendationError ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={retryRecommendation}
            >
              Retry recommendation
            </Button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
