import {
  type MouseEvent,
  type ReactElement,
  useCallback,
  useRef,
  useState,
} from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { GamePlayToolbar } from './components/GamePlayToolbar';
import { FlashcardDialectButtons } from './components/FlashcardDialectButtons';
import { FlashcardExampleSection } from './components/FlashcardExampleSection';
import { FlashcardIpaBadge } from './components/FlashcardIpaBadge';
import { FlashcardNativeSpeechButton } from './components/FlashcardNativeSpeechButton';
import { getExampleAudioUrl, getNativeAudioUrl } from './game.audio';
import { useGameTouchGestures } from './hooks/useGameTouchGestures';
import { useGamePlayLabels } from './hooks/useGamePlayLabels';
import { useFlashcardAudio } from './hooks/useFlashcardAudio';
import { useCardFlipTransition } from './hooks/useCardFlipTransition';
import { capitalizeFirst } from './game.text';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import type { FlashcardGameVM } from './game.types';

interface GameComponentProps {
  flashcard: FlashcardGameVM | null;
  isLoading: boolean;
  isFlipped: boolean;
  currentIndex: number;
  totalCount: number;
  correctCount: number;
  incorrectCount: number;
  canPause?: boolean;
  onFlip: () => void;
  onAnswer: (correct: boolean) => void;
  onPause?: () => void;
}

type AnswerFeedback = 'correct' | 'incorrect' | null;

const FEEDBACK_MS = 320;

export const GameComponent = ({
  flashcard,
  isLoading,
  isFlipped,
  currentIndex,
  totalCount,
  correctCount,
  incorrectCount,
  canPause = false,
  onFlip,
  onAnswer,
  onPause,
}: GameComponentProps): ReactElement => {
  const labels = useGamePlayLabels();
  const { playAudio } = useFlashcardAudio();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const skipFlipTransition = useCardFlipTransition(flashcard?.id);
  const [feedback, setFeedback] = useState<AnswerFeedback>(null);

  const dialectLabel = useCallback(
    (dialect: 'us' | 'uk' | 'au'): string => {
      if (dialect === 'us') return labels.audioDialectUs;
      if (dialect === 'uk') return labels.audioDialectUk;
      return labels.audioDialectAu;
    },
    [labels.audioDialectAu, labels.audioDialectUk, labels.audioDialectUs],
  );

  const handleAnswer = useCallback(
    (correct: boolean, event?: MouseEvent): void => {
      event?.stopPropagation();
      if (feedback !== null) return;
      setFeedback(correct ? 'correct' : 'incorrect');
      window.setTimeout(() => {
        setFeedback(null);
        onAnswer(correct);
      }, FEEDBACK_MS);
    },
    [feedback, onAnswer],
  );

  useGameTouchGestures(cardRef, {
    enabled: !isLoading && flashcard !== null && feedback === null,
    isFlipped,
    onCorrect: () => handleAnswer(true),
    onIncorrect: () => handleAnswer(false),
  });

  if (isLoading || !flashcard) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--color-bg-base)]">
        <LoadingSpinner />
      </div>
    );
  }

  const audioUrls = flashcard.audioUrls;
  const exampleAudioUrl = getExampleAudioUrl(audioUrls);
  const nativeAudioUrl = getNativeAudioUrl(audioUrls);
  const expression = capitalizeFirst(flashcard.expression);
  const meaning = capitalizeFirst(flashcard.meaning);

  const feedbackClass =
    feedback === 'correct'
      ? 'game-card-feedback--correct'
      : feedback === 'incorrect'
        ? 'game-card-feedback--incorrect'
        : '';

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[var(--color-bg-base)]">
      <div className="game-glow" aria-hidden />

      <GamePlayToolbar
        variant="game"
        currentIndex={currentIndex}
        totalCount={totalCount}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        canPause={canPause}
        onPause={onPause}
      />

      <div className="relative flex flex-1 items-center justify-center px-4 py-6 md:px-8 md:py-10">
        <div
          className={[
            'game-card-stage flex w-full max-w-3xl flex-col',
            feedbackClass,
          ].join(' ')}
        >
          <div
            ref={cardRef}
            className="flashcard-play-wrapper game-card-wrapper h-[min(520px,65vh)] min-h-[360px] w-full cursor-pointer sm:min-h-[420px] md:h-[min(560px,72vh)] md:min-h-[480px]"
            style={{ perspective: '1400px' }}
            onClick={() => {
              if (feedback === null) onFlip();
            }}
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
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className="flashcard-card-face absolute inset-0 flex flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-bg-card)]"
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
              </div>

              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="flashcard-card-face absolute inset-0 flex flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-bg-card)]"
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
                  className={[
                    'flex shrink-0 items-center justify-center gap-6 bg-[var(--color-bg-card)] px-4 py-3',
                    feedback === null
                      ? 'opacity-100'
                      : 'pointer-events-none opacity-40',
                  ].join(' ')}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(event) => handleAnswer(false, event)}
                    className="flex size-14 items-center justify-center rounded-full border-2 border-[var(--color-accent-red)]/60 text-[var(--color-accent-red)] transition-all hover:border-[var(--color-accent-red)] hover:bg-[var(--color-accent-red)] hover:text-white active:scale-95"
                    aria-label={labels.incorrect}
                    title={labels.incorrect}
                  >
                    <ThumbsDown size={26} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => handleAnswer(true, event)}
                    className="flex size-14 items-center justify-center rounded-full border-2 border-[var(--color-accent-green)]/60 text-[var(--color-accent-green)] transition-all hover:border-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)] hover:text-[var(--color-bg-base)] active:scale-95"
                    aria-label={labels.correct}
                    title={labels.correct}
                  >
                    <ThumbsUp size={26} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
