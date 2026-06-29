import { type MouseEvent, type ReactElement, useCallback, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { GamePlayToolbar } from '@/containers/game/components/GamePlayToolbar';
import { FlashcardDialectButtons } from '@/containers/game/components/FlashcardDialectButtons';
import { FlashcardExampleSection } from '@/containers/game/components/FlashcardExampleSection';
import { FlashcardIpaBadge } from '@/containers/game/components/FlashcardIpaBadge';
import { FlashcardNativeSpeechButton } from '@/containers/game/components/FlashcardNativeSpeechButton';
import {
  getExampleAudioUrl,
  getNativeAudioUrl,
} from '@/containers/game/game.audio';
import { capitalizeFirst } from '@/containers/game/game.text';
import { useGamePlayLabels } from '@/containers/game/hooks/useGamePlayLabels';
import { useFlashcardAudio } from '@/containers/game/hooks/useFlashcardAudio';
import { useCardFlipTransition } from '@/containers/game/hooks/useCardFlipTransition';
import type { FlashcardGameVM } from '@/containers/game/game.types';
import { useI18n } from '@/core/i18n';
import { useStudyKeyboardShortcuts } from './hooks/useStudyKeyboardShortcuts';
import '@/containers/study/study-ui.css';

interface StudyComponentProps {
  flashcard: FlashcardGameVM | null;
  isLoading: boolean;
  isFlipped: boolean;
  currentIndex: number;
  totalCount: number;
  viewedCount: number;
  canPause?: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPause?: () => void;
}

export const StudyComponent = ({
  flashcard,
  isLoading,
  isFlipped,
  currentIndex,
  totalCount,
  viewedCount,
  canPause = false,
  onFlip,
  onNext,
  onPause,
}: StudyComponentProps): ReactElement => {
  const labels = useGamePlayLabels();
  const { t } = useI18n();
  const studyLabels = t.study.play;
  const { playAudio } = useFlashcardAudio();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const skipFlipTransition = useCardFlipTransition(flashcard?.id);

  const handleNext = useCallback(
    (event?: MouseEvent): void => {
      event?.stopPropagation();
      onNext();
    },
    [onNext],
  );

  useStudyKeyboardShortcuts({
    enabled: !isLoading && flashcard !== null,
    onFlip,
    onNext,
    onPause: canPause ? onPause : undefined,
  });

  const dialectLabel = useCallback(
    (dialect: 'us' | 'uk' | 'au'): string => {
      if (dialect === 'us') return labels.audioDialectUs;
      if (dialect === 'uk') return labels.audioDialectUk;
      return labels.audioDialectAu;
    },
    [labels.audioDialectAu, labels.audioDialectUk, labels.audioDialectUs],
  );

  if (isLoading || !flashcard) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--color-bg-base)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  const audioUrls = flashcard.audioUrls;
  const exampleAudioUrl = getExampleAudioUrl(audioUrls);
  const nativeAudioUrl = getNativeAudioUrl(audioUrls);
  const expression = capitalizeFirst(flashcard.expression);
  const meaning = capitalizeFirst(flashcard.meaning);

  const nextButton = (
    <button
      type="button"
      onClick={handleNext}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
    >
      {studyLabels.next}
      <ChevronRight size={18} />
    </button>
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[var(--color-bg-base)]">
      <div className="study-shell-glow" aria-hidden />

      <GamePlayToolbar
        variant="study"
        currentIndex={currentIndex}
        totalCount={totalCount}
        correctCount={0}
        incorrectCount={0}
        viewedCount={viewedCount}
        canPause={canPause}
        onPause={onPause}
      />

      <div className="relative flex flex-1 items-center justify-center px-4 py-6 md:px-8 md:py-10">
        <div
          key={flashcard.id}
          className="study-card-stage flex w-full max-w-3xl flex-col"
        >
          <div
            ref={cardRef}
            className="flashcard-play-wrapper study-card-wrapper h-[min(520px,65vh)] min-h-[360px] w-full cursor-pointer sm:min-h-[420px] md:h-[min(560px,72vh)] md:min-h-[480px]"
            style={{ perspective: '1400px' }}
            onClick={onFlip}
          >
            <div
              className="game-card-inner relative size-full"
              style={{
                transformStyle: 'preserve-3d',
                transition: skipFlipTransition
                  ? 'none'
                  : 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div
                style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 flex flex-col overflow-hidden rounded-[var(--radius-xl)] border bg-[var(--color-bg-card)]"
              >
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto p-6 text-center md:p-8">
                  <span className="text-4xl font-bold text-[var(--color-text-primary)] md:text-5xl lg:text-6xl">
                    {expression}
                  </span>
                  {flashcard.ipaNotation ? (
                    <FlashcardIpaBadge notation={flashcard.ipaNotation} />
                  ) : null}
                  {audioUrls ? (
                    <FlashcardDialectButtons
                      audioUrls={audioUrls}
                      dialectLabel={dialectLabel}
                      onPlay={playAudio}
                    />
                  ) : null}
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {labels.clickToReveal}
                  </span>
                </div>

                <div
                  className="study-next-bar shrink-0 border-t p-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full rounded-full border border-[var(--color-border-strong)] py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
                  >
                    {studyLabels.markAndContinue}
                  </button>
                </div>
              </div>

              <div
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="absolute inset-0 flex flex-col overflow-hidden rounded-[var(--radius-xl)] border bg-[var(--color-bg-card)]"
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <div className="flex min-h-full flex-col items-center justify-center gap-5 px-5 py-5 md:gap-6 md:px-6 md:py-6">
                    <div className="w-full max-w-md shrink-0 space-y-2 text-center">
                      <p className="text-2xl font-bold text-[var(--color-text-primary)] md:text-3xl">
                        {expression}
                      </p>
                      <p className="text-lg font-semibold text-[var(--color-brand-light)]">
                        {meaning}
                      </p>
                      {flashcard.ipaNotation ? (
                        <FlashcardIpaBadge notation={flashcard.ipaNotation} />
                      ) : null}
                      {audioUrls ? (
                        <FlashcardDialectButtons
                          audioUrls={audioUrls}
                          dialectLabel={dialectLabel}
                          onPlay={playAudio}
                        />
                      ) : null}
                    </div>

                    <FlashcardExampleSection
                      examples={flashcard.examples}
                      exampleAudioUrl={exampleAudioUrl}
                      playExampleLabel={labels.playExample}
                      onPlayExample={playAudio}
                    />

                    {flashcard.nativeSpeech && nativeAudioUrl !== null ? (
                      <FlashcardNativeSpeechButton
                        label={labels.listenNative}
                        audioUrl={nativeAudioUrl}
                        onPlay={playAudio}
                      />
                    ) : null}
                  </div>
                </div>

                <div
                  className="study-next-bar shrink-0 border-t p-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  {nextButton}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
