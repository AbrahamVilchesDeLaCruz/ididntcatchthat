import { type ReactElement } from 'react';
import { ArrowRight, Hand, Pause } from 'lucide-react';
import { useI18n } from '@/core/i18n';
import { useGamePlayLabels } from '../hooks/useGamePlayLabels';
import { usePrefersFinePointer } from '../hooks/usePrefersFinePointer';

interface GamePlayToolbarProps {
  variant?: 'game' | 'study';
  currentIndex: number;
  totalCount: number;
  correctCount: number;
  incorrectCount: number;
  viewedCount?: number;
  canPause: boolean;
  onPause?: () => void;
}

export const GamePlayToolbar = ({
  variant = 'game',
  currentIndex,
  totalCount,
  correctCount,
  incorrectCount,
  viewedCount = 0,
  canPause,
  onPause,
}: GamePlayToolbarProps): ReactElement => {
  const labels = useGamePlayLabels();
  const { t } = useI18n();
  const studyLabels = t.study.play;
  const prefersFinePointer = usePrefersFinePointer();
  const isStudy = variant === 'study';

  const answered = correctCount + incorrectCount;
  const pending = Math.max(totalCount - answered, 0);
  const correctPct = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
  const incorrectPct = totalCount > 0 ? (incorrectCount / totalCount) * 100 : 0;
  const pendingPct = totalCount > 0 ? (pending / totalCount) * 100 : 0;
  const viewedPct = totalCount > 0 ? (viewedCount / totalCount) * 100 : 0;

  const progressValue = isStudy ? viewedCount : answered;
  const progressMax = totalCount;

  return (
    <div
      className={[
        'border-b bg-[var(--color-bg-base)]/80 px-4 py-3 backdrop-blur-sm md:px-6',
        isStudy
          ? 'study-play-toolbar border-[var(--color-border)]'
          : 'border-[var(--color-border)]',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium tabular-nums text-[var(--color-text-secondary)]">
            {isStudy ? `${studyLabels.sessionLabel} · ` : ''}
            {currentIndex + 1} {labels.cardOf} {totalCount}
          </span>
          {canPause && onPause ? (
            <button
              type="button"
              onClick={onPause}
              className="rounded-lg border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand-light)]"
              aria-label={isStudy ? studyLabels.pause : labels.pause}
              title={isStudy ? studyLabels.pause : labels.pause}
            >
              <Pause size={15} strokeWidth={2} />
            </button>
          ) : null}
        </div>

        <div
          className="flex h-2 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]"
          role="progressbar"
          aria-valuenow={progressValue}
          aria-valuemin={0}
          aria-valuemax={progressMax}
          aria-label={
            isStudy ? studyLabels.progressLabel : labels.progressLabel
          }
        >
          {isStudy ? (
            <div
              className="study-progress-fill h-full transition-all duration-300"
              style={{ width: `${viewedPct}%` }}
            />
          ) : (
            <>
              {correctPct > 0 ? (
                <div
                  className="h-full bg-[var(--color-accent-green)] transition-all duration-300"
                  style={{ width: `${correctPct}%` }}
                />
              ) : null}
              {incorrectPct > 0 ? (
                <div
                  className="h-full bg-[var(--color-accent-red)] transition-all duration-300"
                  style={{ width: `${incorrectPct}%` }}
                />
              ) : null}
              {pendingPct > 0 ? (
                <div
                  className="h-full bg-[var(--color-border-strong)] transition-all duration-300"
                  style={{ width: `${pendingPct}%` }}
                />
              ) : null}
            </>
          )}
        </div>

        <div className="flex min-h-[2.25rem] flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--color-text-secondary)]">
          {prefersFinePointer ? (
            isStudy ? (
              <>
                <span className="inline-flex items-center gap-2">
                  <span>{labels.shortcutFlip}</span>
                  <kbd className="game-kbd rounded px-2 py-1 font-mono text-xs">
                    Space
                  </kbd>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span>{studyLabels.shortcutNext}</span>
                  <kbd className="game-kbd rounded px-2 py-1 font-mono text-xs">
                    Enter
                  </kbd>
                </span>
                {canPause ? (
                  <span className="inline-flex items-center gap-2">
                    <span>{studyLabels.pause}</span>
                    <kbd className="game-kbd rounded px-2 py-1 font-mono text-xs">
                      P
                    </kbd>
                  </span>
                ) : null}
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-2">
                  <span>{labels.shortcutFlip}</span>
                  <kbd className="game-kbd rounded px-2 py-1 font-mono text-xs">
                    Space
                  </kbd>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span>{labels.shortcutIncorrect}</span>
                  <kbd className="game-kbd rounded px-2 py-1 font-mono text-xs">
                    ←
                  </kbd>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span>{labels.shortcutCorrect}</span>
                  <kbd className="game-kbd rounded px-2 py-1 font-mono text-xs">
                    →
                  </kbd>
                </span>
                {canPause ? (
                  <span className="inline-flex items-center gap-2">
                    <span>{labels.shortcutPause}</span>
                    <kbd className="game-kbd rounded px-2 py-1 font-mono text-xs">
                      P
                    </kbd>
                  </span>
                ) : null}
              </>
            )
          ) : isStudy ? (
            <>
              <span className="inline-flex items-center gap-2">
                <Hand size={16} strokeWidth={2} aria-hidden />
                <span>{labels.tapToReveal}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <ArrowRight size={16} strokeWidth={2} aria-hidden />
                <span>{studyLabels.tapNext}</span>
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2">
                <Hand size={16} strokeWidth={2} aria-hidden />
                <span>{labels.tapToReveal}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span>{labels.touchSwipeIncorrect}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span>{labels.touchSwipeCorrect}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
