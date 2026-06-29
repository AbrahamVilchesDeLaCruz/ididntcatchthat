import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import type { StudySummaryVM } from './study.types';
import '@/containers/study/study-ui.css';

interface StudySummaryComponentProps {
  summary: StudySummaryVM;
  currentStreak: number;
  onStudyAgain: () => void;
  onPlayGame: () => void;
}

export const StudySummaryComponent = ({
  summary,
  currentStreak,
  onStudyAgain,
  onPlayGame,
}: StudySummaryComponentProps): ReactElement => {
  const { t } = useI18n();
  const ss = t.study.summary;
  const minutes = Math.floor(summary.duration / 60);
  const seconds = summary.duration % 60;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[var(--color-bg-base)] px-5 py-16">
      <div className="study-summary-card w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {ss.title}
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">{ss.subtitle}</p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-text-muted)]">
              {ss.cardsViewed}
            </p>
            <p className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
              {summary.cardsViewed}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-text-muted)]">
              {ss.duration}
            </p>
            <p className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        {currentStreak > 0 ? (
          <div className="study-streak-badge mt-6 rounded-xl border border-[var(--color-brand-dim)] bg-[var(--color-brand-dim)] p-4">
            <p className="text-sm text-[var(--color-brand-light)]">
              {ss.streak.replace('{count}', String(currentStreak))}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStudyAgain}
            className="flex-1 rounded-full bg-[var(--color-brand)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {ss.studyAgain}
          </button>
          <button
            type="button"
            onClick={onPlayGame}
            className="flex-1 rounded-full border border-[var(--color-border-strong)] py-3 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-brand)]"
          >
            {ss.playGame}
          </button>
        </div>
      </div>
    </div>
  );
};
