"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { AnnotationCard } from "@/components/annotation-card";
import { AnnotationReview } from "@/components/annotation-review";
import { AnnotationTimeline } from "@/components/annotation-timeline";
import { AppDialog } from "@/components/app-dialog";
import { AppShell } from "@/components/app-shell";
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
import { Button } from "@/components/ui/button";
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
  const {
    isOpen: isReflectionOpen,
    openReflection,
    setReflectionOpen,
  } = useReflectionPrompt();

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
    setReflectionOpen(false);
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

  const hasAnnotations =
    !isAnnotationsPending && !isAnnotationsError && annotations.length > 0;

  const showReflectionDialog = isReflectionOpen && !reflection;

  useEffect(() => {
    if (showReflectionDialog) {
      player.pause();
    }
  }, [showReflectionDialog, player.pause]);

  return (
    <AppShell className="gap-6" onNavigateHome={() => player.pause()}>
      <AppDialog
        open={showReflectionDialog}
        onOpenChange={(open) => {
          if (!open) {
            setReflectionOpen(false);
            return;
          }
          player.pause();
          setReflectionOpen(true);
        }}
        title="What stood out?"
        description="A moment, mood, or detail that caught your ear. No wrong answers."
      >
        <ReflectionForm
          pieceId={piece.id}
          variant="dialog"
          submittedReflection={null}
          onSubmit={handleReflectionSubmit}
          isSaving={isPersistingReflection}
          saveError={persistReflectionError}
        />
      </AppDialog>

      <div className="grid min-h-[calc(100vh-5.5rem)] gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <aside className="flex flex-col gap-5 lg:sticky lg:top-5">
          <header className="space-y-2">
            <p className="text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
              {piece.composer}
              <span className="mx-2 text-border">·</span>
              {piece.era}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance xl:text-4xl">
              {piece.title}
            </h1>
            {piece.movement ? (
              <p className="text-muted-foreground">{piece.movement}</p>
            ) : null}
          </header>

          <AudioPlayer
            containerRef={player.containerRef}
            isReady={player.isReady}
            loadError={player.loadError}
            onRetry={player.retry}
          />

          <div className="flex flex-wrap items-center gap-3">
            <PlaybackControls
              isReady={player.isReady}
              isPlaying={player.isPlaying}
              onPlay={player.play}
              onPause={player.pause}
            />

            {player.isReady && !reflection ? (
              <button
                type="button"
                onClick={handleDoneListening}
                className="text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
              >
                Done listening
              </button>
            ) : null}
          </div>

          {showAnnotationLoading ? (
            <LoadingPanel
              title="Generating annotations"
              description="Building a guided timeline…"
            />
          ) : null}

          {showAnnotationRegenerating ? (
            <LoadingPanel
              title="Regenerating"
              description="Creating a fresh set of notes…"
            />
          ) : null}

          {annotationErrorMessage ? (
            <ErrorPanel
              title={annotationErrorMessage.title}
              description={annotationErrorMessage.description}
              onRetry={() => void refetch()}
            />
          ) : null}

          {hasAnnotations ? (
            <AnnotationTimeline
              annotations={annotations}
              currentTime={player.currentTime}
              duration={player.duration}
              onSeek={player.seekTo}
            />
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-col gap-10 lg:min-h-[calc(100vh-5.5rem)] lg:border-l lg:border-border lg:pl-8">
          {saveError ? (
            <ErrorPanel
              title="Could not save annotation edits"
              description={saveError}
            />
          ) : null}

          {hasAnnotations ? (
            <section className="space-y-8">
              <AnnotationCard annotations={annotations} />
              <AnnotationReview
                annotations={annotations}
                onUpdate={updateAnnotation}
                onDelete={deleteAnnotation}
                onRegenerate={() => void handleRegenerate()}
                isRegenerating={isAnnotationsFetching}
              />
              <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                Notes are drawn from musical knowledge of this work, not from
                analyzing the audio waveform.
              </p>
            </section>
          ) : null}

          {!isAnnotationsPending &&
          !isAnnotationsError &&
          annotations.length === 0 &&
          reflection ? (
            <EmptyPanel
              title="No annotations available"
              description="Recommendations need at least one annotation. Regenerate or reload to try again."
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

          {reflection ? (
            <ReflectionForm
              pieceId={piece.id}
              submittedReflection={reflection}
              onSubmit={handleReflectionSubmit}
              isSaving={isPersistingReflection}
              saveError={persistReflectionError}
            />
          ) : null}

          {reflection && annotations.length > 0 ? (
            <section className="animate-fade-in space-y-8 border-t border-border pt-10">
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

              {recommendedPiece ? (
                <RecommendationCard
                  piece={recommendedPiece}
                  isComplete={isRecommendationComplete}
                  onStartListening={handleStartListening}
                />
              ) : null}

              {recommendationSaveError ? (
                <ErrorPanel
                  title="Could not save recommendation"
                  description={recommendationSaveError}
                />
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
