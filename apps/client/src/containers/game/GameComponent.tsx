import {
  type MouseEvent,
  type ReactElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Volume2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { GamePlayToolbar } from './components/GamePlayToolbar';
import { getExampleAudioUrl, getNativeAudioUrl } from './game.audio';
import { useGameTouchGestures } from './hooks/useGameTouchGestures';
import { useGamePlayLabels } from './hooks/useGamePlayLabels';
import { capitalizeFirst } from './game.text';
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

type AudioDialect = 'us' | 'uk' | 'au';
type AnswerFeedback = 'correct' | 'incorrect' | null;

const DIALECT_FLAGS: Record<AudioDialect, string> = {
  us: '🇺🇸',
  uk: '🇬🇧',
  au: '🇦🇺',
};

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const prevFlashcardIdRef = useRef<string | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback>(null);
  const [skipFlipTransition, setSkipFlipTransition] = useState(false);

  useLayoutEffect(() => {
    const nextId = flashcard?.id ?? null;
    if (
      prevFlashcardIdRef.current !== null &&
      prevFlashcardIdRef.current !== nextId
    ) {
      setSkipFlipTransition(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSkipFlipTransition(false));
      });
    }
    prevFlashcardIdRef.current = nextId;
  }, [flashcard?.id]);

  const dialectLabel = (dialect: AudioDialect): string => {
    if (dialect === 'us') return labels.audioDialectUs;
    if (dialect === 'uk') return labels.audioDialectUk;
    return labels.audioDialectAu;
  };

  const playAudio = useCallback((url: string, e: MouseEvent): void => {
    e.stopPropagation();
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      void audioRef.current.play();
    } else {
      const audio = new Audio(url);
      audioRef.current = audio;
      void audio.play();
    }
  }, []);

  const handleAnswer = useCallback(
    (correct: boolean, e?: MouseEvent): void => {
      e?.stopPropagation();
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

  const renderDialectButtons = (
    audioUrls: NonNullable<FlashcardGameVM['audioUrls']>,
  ): ReactElement => (
    <div
      className="flex flex-wrap justify-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {(['us', 'uk', 'au'] as AudioDialect[]).map((dialect) => {
        const url = audioUrls.expression[dialect];
        if (!url) return null;
        return (
          <button
            key={dialect}
            type="button"
            onClick={(e) => playAudio(url, e)}
            className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] active:scale-95"
            title={dialectLabel(dialect)}
            aria-label={dialectLabel(dialect)}
          >
            <span>{DIALECT_FLAGS[dialect]}</span>
            <span aria-hidden>▶</span>
          </button>
        );
      })}
    </div>
  );

  const renderIpaBadge = (notation: string): ReactElement => (
    <span className="inline-block rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-1 font-mono text-sm text-[var(--color-brand-light)]">
      {notation}
    </span>
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
            className="game-card-wrapper h-[min(560px,72vh)] min-h-[480px] w-full cursor-pointer"
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
              {/* Front — word + phoneme */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className="absolute inset-0 flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-card)]"
              >
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto p-6 text-center md:p-8">
                  <span className="text-4xl font-bold text-[var(--color-text-primary)] md:text-5xl lg:text-6xl">
                    {expression}
                  </span>
                  {flashcard.ipaNotation
                    ? renderIpaBadge(flashcard.ipaNotation)
                    : null}
                  {audioUrls ? renderDialectButtons(audioUrls) : null}
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {labels.clickToReveal}
                  </span>
                </div>
              </div>

              {/* Back — scrollable content + fixed thumbs */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="absolute inset-0 flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-card)]"
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
                      {flashcard.ipaNotation
                        ? renderIpaBadge(flashcard.ipaNotation)
                        : null}
                      {audioUrls ? renderDialectButtons(audioUrls) : null}
                    </div>

                    {flashcard.examples.length > 0 ? (
                      <div className="w-full max-w-md shrink-0">
                        {exampleAudioUrl !== null ? (
                          <div className="mb-3 flex justify-center">
                            <button
                              type="button"
                              onClick={(e) => playAudio(exampleAudioUrl, e)}
                              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                              title={labels.playExample}
                              aria-label={labels.playExample}
                            >
                              <Volume2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        ) : null}
                        <ul className="flex flex-col gap-4">
                          {flashcard.examples.map((ex) => (
                            <li key={ex.id} className="text-center">
                              <p className="text-[15px] italic text-[var(--color-text-primary)]">
                                "{capitalizeFirst(ex.textEn)}"
                              </p>
                              <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                                {capitalizeFirst(ex.textEs)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {flashcard.nativeSpeech && nativeAudioUrl !== null ? (
                      <button
                        type="button"
                        onClick={(e) => playAudio(nativeAudioUrl, e)}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                      >
                        🗣 {labels.listenNative}
                      </button>
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
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleAnswer(false, e)}
                    className="flex size-14 items-center justify-center rounded-full border-2 border-[var(--color-accent-red)]/60 text-[var(--color-accent-red)] transition-all hover:border-[var(--color-accent-red)] hover:bg-[var(--color-accent-red)] hover:text-white active:scale-95"
                    aria-label={labels.incorrect}
                    title={labels.incorrect}
                  >
                    <ThumbsDown size={26} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleAnswer(true, e)}
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
