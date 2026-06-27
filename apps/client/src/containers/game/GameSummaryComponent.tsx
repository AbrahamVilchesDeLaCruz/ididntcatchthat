import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import type { GameSummaryVM } from './game.types';

interface GameSummaryComponentProps {
  summary: GameSummaryVM;
  isGuest: boolean;
  pausedGamesCount?: number;
  onPlayAgain: () => void;
  onViewPaused?: () => void;
  onRegister: () => void;
  onViewStats: () => void;
  onPracticeWeakest?: () => void;
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const getAccuracyEmoji = (pct: number): string => {
  if (pct >= 90) return '🔥';
  if (pct >= 70) return '💪';
  if (pct >= 50) return '📈';
  return '🎯';
};

export const GameSummaryComponent = ({
  summary,
  isGuest,
  pausedGamesCount = 0,
  onPlayAgain,
  onViewPaused,
  onRegister,
  onViewStats,
  onPracticeWeakest,
}: GameSummaryComponentProps): ReactElement => {
  const { t } = useI18n();
  const gs = t.game.summary;

  const accuracyPct = Math.round(summary.accuracy * 100);
  const emoji = getAccuracyEmoji(accuracyPct);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[var(--color-bg-base)] px-5 py-12 md:py-16 lg:px-8">
      <div className="w-full max-w-sm md:max-w-xl lg:max-w-3xl">
        <div className="mb-2 text-center text-5xl md:text-6xl">{emoji}</div>
        <h1 className="mb-2 text-center text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">
          {gs.title}
        </h1>
        <p className="mb-10 text-center text-sm text-[var(--color-text-muted)]">
          {accuracyPct >= 70 ? gs.subtitleGood : gs.subtitleKeepGoing}
        </p>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label={gs.accuracy} value={`${accuracyPct}%`} highlight />
          <StatCard
            label={gs.correct}
            value={`${summary.correctCount}/${summary.totalCount}`}
          />
          <StatCard label={gs.total} value={String(summary.totalCount)} />
          <StatCard
            label={gs.duration}
            value={formatDuration(summary.duration)}
          />
        </div>

        {(summary.failedCards?.length ?? 0) > 0 ? (
          <div className="mb-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
              {gs.failedCardsTitle}
            </p>
            <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
              {summary.failedCards!.slice(0, 5).map((card) => (
                <li key={card.id}>{card.expression}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {isGuest ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:justify-center">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-elevated)] p-5 text-center lg:min-w-[20rem] lg:flex-1">
              <p className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
                {gs.registerTitle}
              </p>
              <p className="mb-4 text-xs text-[var(--color-text-muted)]">
                {gs.registerHint}
              </p>
              <button
                onClick={onRegister}
                className="w-full rounded-full bg-[var(--color-brand)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                {gs.ctaRegister}
              </button>
            </div>

            <button
              onClick={onPlayAgain}
              className="w-full rounded-full border border-[var(--color-border-strong)] py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)] lg:max-w-xs lg:self-center"
            >
              {gs.ctaPlayAgain}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
            {pausedGamesCount > 0 && onViewPaused ? (
              <button
                type="button"
                onClick={onViewPaused}
                className="w-full rounded-full border border-[var(--color-brand-dim)] bg-[var(--color-brand-dim)] py-3 text-sm font-medium text-[var(--color-brand-light)] lg:col-span-2"
              >
                {gs.pausedGamesLink.replace(
                  '{count}',
                  String(pausedGamesCount),
                )}
              </button>
            ) : null}
            <button
              onClick={onPlayAgain}
              className="w-full rounded-full bg-[var(--color-brand)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              {gs.ctaPlayAgain}
            </button>
            <button
              onClick={onPlayAgain}
              className="w-full rounded-full border border-[var(--color-border-strong)] py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
            >
              {gs.ctaChooseModule}
            </button>
            <button
              onClick={onViewStats}
              className="w-full rounded-full border border-[var(--color-border-strong)] py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)] lg:col-span-2 lg:max-w-sm lg:justify-self-center"
            >
              {gs.ctaViewStats}
            </button>
            {onPracticeWeakest ? (
              <button
                type="button"
                onClick={onPracticeWeakest}
                className="w-full rounded-full border border-[var(--color-brand)] py-3 text-sm font-semibold text-[var(--color-brand-light)] lg:col-span-2 lg:max-w-sm lg:justify-self-center"
              >
                {gs.ctaPracticeWeakest}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const StatCard = ({
  label,
  value,
  highlight = false,
}: StatCardProps): ReactElement => (
  <div className="flex flex-col items-center justify-center gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 md:p-6">
    <span
      className={[
        'text-2xl font-bold md:text-3xl',
        highlight
          ? 'text-[var(--color-brand-light)]'
          : 'text-[var(--color-text-primary)]',
      ].join(' ')}
    >
      {value}
    </span>
    <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
  </div>
);
