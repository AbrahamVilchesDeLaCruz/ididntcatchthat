import { type ReactElement, useRef } from 'react';
import { useI18n } from '@/core/i18n';
import type { FlashcardGameVM } from './game.types';

interface GameComponentProps {
  flashcard: FlashcardGameVM | null;
  isLoading: boolean;
  isFlipped: boolean;
  currentIndex: number;
  totalCount: number;
  canPause?: boolean;
  onFlip: () => void;
  onAnswer: (correct: boolean) => void;
  onPause?: () => void;
}

type AudioDialect = 'us' | 'uk' | 'au';

const DIALECT_LABELS: Record<AudioDialect, string> = {
  us: '🇺🇸',
  uk: '🇬🇧',
  au: '🇦🇺',
};

export const GameComponent = ({
  flashcard,
  isLoading,
  isFlipped,
  currentIndex,
  totalCount,
  canPause = false,
  onFlip,
  onAnswer,
  onPause,
}: GameComponentProps): ReactElement => {
  const { t } = useI18n();
  const gp = t.game.play;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (url: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      void audioRef.current.play();
    } else {
      const audio = new Audio(url);
      audioRef.current = audio;
      void audio.play();
    }
  };

  if (isLoading || !flashcard) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--color-bg-base)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  const progressPct = ((currentIndex + 1) / totalCount) * 100;
  const audioUrls = flashcard.audioUrls;

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-base)]">
      {/* Progress bar */}
      <div className="h-1 w-full bg-[var(--color-bg-elevated)]">
        <div
          className="h-full bg-[var(--color-brand)] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Counter + pause */}
      <div className="flex items-center justify-between px-5 py-3">
        {canPause && onPause ? (
          <button
            type="button"
            onClick={onPause}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)]"
          >
            ⏸ Pausar
          </button>
        ) : (
          <span />
        )}
        <span className="text-sm text-[var(--color-text-muted)]">
          {currentIndex + 1} {gp.cardOf} {totalCount}
        </span>
      </div>

      {/* Card area */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
        {/* Flashcard — CSS 3D flip (toggle) */}
        <div
          className="game-card-wrapper cursor-pointer"
          style={{
            width: '100%',
            maxWidth: '420px',
            height: '300px',
            perspective: '1200px',
          }}
          onClick={onFlip}
        >
          <div
            className="game-card-inner"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8"
            >
              <span className="text-4xl font-bold text-[var(--color-text-primary)]">
                {flashcard.expression}
              </span>
              {flashcard.ipaNotation && (
                <span className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-1.5 font-mono text-base text-[var(--color-brand-light)]">
                  {flashcard.ipaNotation}
                </span>
              )}

              {/* Audio — 3 dialects */}
              {audioUrls && (
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(['us', 'uk', 'au'] as AudioDialect[]).map((dialect) => (
                    <button
                      key={dialect}
                      onClick={(e) =>
                        playAudio(audioUrls.expression[dialect], e)
                      }
                      className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] active:scale-95"
                      title={`Play ${dialect.toUpperCase()} audio`}
                    >
                      <span>{DIALECT_LABELS[dialect]}</span>
                      <span>▶</span>
                    </button>
                  ))}
                </div>
              )}

              <span className="mt-1 text-sm text-[var(--color-text-muted)]">
                {isFlipped ? gp.tapToFlipBack : gp.tapToReveal}
              </span>
            </div>

            {/* Back */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
              className="absolute inset-0 flex flex-col items-center justify-start gap-3 rounded-[var(--radius-xl)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-card)] p-6 overflow-y-auto"
            >
              <span className="text-2xl font-bold text-[var(--color-brand-light)] shrink-0">
                {flashcard.meaning}
              </span>

              {flashcard.examples.length > 0 && (
                <div className="flex w-full flex-col gap-3">
                  {flashcard.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
                    >
                      <p className="text-center text-sm italic text-[var(--color-text-secondary)]">
                        "{ex.textEn}"
                      </p>
                      <p className="text-center text-xs text-[var(--color-text-muted)]">
                        {ex.textEs}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Audio — example */}
              {audioUrls?.examples.us && (
                <button
                  onClick={(e) => playAudio(audioUrls.examples.us, e)}
                  className="shrink-0 flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] active:scale-95"
                >
                  🇺🇸 ▶ <span>Listen to example</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Answer buttons — only visible when flipped */}
        <div
          className={[
            'mt-8 flex w-full max-w-[420px] gap-4 transition-all duration-300',
            isFlipped
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none',
          ].join(' ')}
        >
          <button
            onClick={() => onAnswer(false)}
            className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-accent-red)] bg-transparent py-4 text-sm font-semibold text-[var(--color-accent-red)] transition-colors hover:bg-[var(--color-accent-red)] hover:text-white active:scale-[0.97]"
          >
            ✗ {gp.incorrect}
          </button>
          <button
            onClick={() => onAnswer(true)}
            className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-accent-green)] bg-transparent py-4 text-sm font-semibold text-[var(--color-accent-green)] transition-colors hover:bg-[var(--color-accent-green)] hover:text-white active:scale-[0.97]"
          >
            ✓ {gp.correct}
          </button>
        </div>
      </div>
    </div>
  );
};
