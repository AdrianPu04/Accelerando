"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AnnotationCard } from "@/components/annotation-card";
import { AnnotationReview } from "@/components/annotation-review";
import { AnnotationTimeline } from "@/components/annotation-timeline";
import { AudioPlayer } from "@/components/audio-player";
import { PlaybackControls } from "@/components/playback-controls";
import { RecommendationCard } from "@/components/recommendation-card";
import { RecommendationReveal } from "@/components/recommendation-reveal";
import { ReflectionForm } from "@/components/reflection-form";
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
} from "@/components/status-panel";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAnnotations } from "@/hooks/use-annotations";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useEditableAnnotations } from "@/hooks/use-editable-annotations";
import { useListeningSession } from "@/hooks/use-listening-session";
import { useRecommendation } from "@/hooks/use-recommendation";
import { useReflectionPrompt } from "@/hooks/use-reflection-prompt";
import { useSupabase } from "@/components/supabase-provider";
import { createRecommendationId } from "@/lib/storage/ids";
import { startPieceSession, prepareRecommendedPiece } from "@/lib/player";
import {
  formatAiError,
  formatStorageError,
  getErrorMessage,
} from "@/lib/user-messages";
import { cn } from "@/lib/utils";
import type { Piece, Reflection } from "@/types";

interface ListenPageClientProps {
  piece: Piece;
}

export function ListenPageClient({ piece }: ListenPageClientProps) {
  const queryClient = useQueryClient();
  const { storage } = useSupabase();
  const [recommendationSaveError, setRecommendationSaveError] = useState<
    string | null
  >(null);

  useEffect(() => {
    startPieceSession(piece.id);
  }, [piece.id]);

  const player = useAudioPlayer(piece);
  const {
    sessionId,
    reflection,
    persistReflection,
    isPersistingReflection,
    persistReflectionError,
  } = useListeningSession(piece.id);
  const { isOpen: isReflectionOpen, openReflection } = useReflectionPrompt(
    player.currentTime,
    player.duration,
  );

  const {
    data: fetchedAnnotations,
    isPending: isAnnotationsPending,
    isError: isAnnotationsError,
    error: annotationsError,
    refetch,
    isFetching: isAnnotationsFetching,
  } = useAnnotations(piece.id);

  const { annotations, updateAnnotation, deleteAnnotation, saveError } =
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

  const savedForSessionRef = useRef<string | null>(null);
  const recommendationIdRef = useRef<string | null>(null);

  useEffect(() => {
    savedForSessionRef.current = null;
    recommendationIdRef.current = null;
    setRecommendationSaveError(null);
  }, [sessionId]);

  useEffect(() => {
    if (
      !isRecommendationComplete ||
      !recommendedPiece ||
      !reflection ||
      !sessionId ||
      !reasoning.trim()
    ) {
      return;
    }

    if (savedForSessionRef.current === sessionId) {
      return;
    }

    if (!recommendationIdRef.current) {
      recommendationIdRef.current = createRecommendationId();
    }

    savedForSessionRef.current = sessionId;
    setRecommendationSaveError(null);

    void storage
      .saveRecommendationForSession(sessionId, {
        id: recommendationIdRef.current,
        fromPieceId: piece.id,
        toPiece: recommendedPiece,
        reasoning,
        basedOn: [
          reflection.id,
          ...annotations.map((annotation) => annotation.id),
        ],
        createdAt: new Date().toISOString(),
      })
      .catch((error) => {
        savedForSessionRef.current = null;
        setRecommendationSaveError(
          formatStorageError(getErrorMessage(error)).description,
        );
      });
  }, [
    annotations,
    isRecommendationComplete,
    piece.id,
    reasoning,
    recommendedPiece,
    reflection,
    sessionId,
    storage,
  ]);

  const handleRegenerate = async () => {
    await storage.clearCachedAnnotations(piece.id);
    await queryClient.invalidateQueries({
      queryKey: ["annotations", piece.id],
    });
    await refetch();
  };

  const handleDoneListening = () => {
    player.pause();
    openReflection();
  };

  const handleReflectionSubmit = async (nextReflection: Reflection) => {
    await persistReflection(nextReflection);
  };

  const handleStartListening = (nextPieceId: string) => {
    prepareRecommendedPiece(nextPieceId);
  };

  const annotationErrorMessage = isAnnotationsError
    ? formatAiError(
        annotationsError instanceof Error
          ? annotationsError.message
          : "Could not generate annotations.",
      )
    : null;

  const showAnnotationLoading =
    isAnnotationsPending && !isAnnotationsError && annotations.length === 0;
  const showAnnotationRegenerating =
    isAnnotationsFetching && annotations.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
      <Link
        href="/"
        onClick={() => player.pause()}
        className={cn(
          buttonVariants({ variant: "ghost", size: "xs" }),
          "-ml-3 w-fit",
        )}
      >
        <ArrowLeft />
        Home
      </Link>

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

      {showAnnotationLoading ? (
        <LoadingPanel
          title="Generating annotations"
          description="Building a guided timeline from musical knowledge of this work…"
        />
      ) : null}

      {showAnnotationRegenerating ? (
        <LoadingPanel
          title="Regenerating annotations"
          description="Creating a fresh set of notes for this recording…"
        />
      ) : null}

      {annotationErrorMessage ? (
        <ErrorPanel
          title={annotationErrorMessage.title}
          description={annotationErrorMessage.description}
          onRetry={() => void refetch()}
        />
      ) : null}

      {saveError ? (
        <ErrorPanel
          title="Could not save annotation edits"
          description={saveError}
        />
      ) : null}

      {!isAnnotationsPending && !isAnnotationsError && annotations.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground">
            Annotations are generated from musical knowledge of this work, not
            by analyzing the recording.
          </p>

          <AnnotationTimeline
            annotations={annotations}
            currentTime={player.currentTime}
            duration={player.duration}
            onSeek={player.seekTo}
          />

          <AnnotationCard annotations={annotations} />

          <AnnotationReview
            annotations={annotations}
            onUpdate={updateAnnotation}
            onDelete={deleteAnnotation}
            onRegenerate={() => void handleRegenerate()}
            isRegenerating={isAnnotationsFetching}
          />
        </>
      ) : null}

      {!isAnnotationsPending &&
      !isAnnotationsError &&
      annotations.length === 0 &&
      (reflection || isReflectionOpen) ? (
        <EmptyPanel
          title="No annotations available"
          description="Recommendations need at least one annotation. Regenerate annotations or reload the page to try again."
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void refetch()}
            >
              Generate annotations
            </Button>
          }
        />
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
          isSaving={isPersistingReflection}
          saveError={persistReflectionError}
        />
      ) : null}

      {reflection && annotations.length > 0 ? (
        <>
          {recommendedPiece ? (
            <RecommendationCard
              piece={recommendedPiece}
              reasoning={reasoning}
              isComplete={isRecommendationComplete}
              onStartListening={handleStartListening}
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

          {recommendationSaveError ? (
            <ErrorPanel
              title="Could not save recommendation"
              description={recommendationSaveError}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
