import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import type { GameSummaryVM } from './game.types';

interface GameSummaryComponentProps {
  summary: GameSummaryVM;
  isGuest: boolean;
  onPlayAgain: () => void;
  onRegister: () => void;
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
  onPlayAgain,
  onRegister,
}: GameSummaryComponentProps): ReactElement => {
  const { t } = useI18n();
  const gs = t.game.summary;

  const accuracyPct = Math.round(summary.accuracy * 100);
  const emoji = getAccuracyEmoji(accuracyPct);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[var(--color-bg-base)] px-5 py-16">
      {/* Title */}
      <div className="mb-2 text-5xl">{emoji}</div>
      <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
        {gs.title}
      </h1>
      <p className="mb-10 text-sm text-[var(--color-text-muted)]">
        {accuracyPct >= 70 ? gs.subtitleGood : gs.subtitleKeepGoing}
      </p>

      {/* Stats grid */}
      <div className="mb-10 grid w-full max-w-sm grid-cols-2 gap-4">
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

      {/* CTAs */}
      {isGuest ? (
        <div className="flex w-full max-w-sm flex-col gap-3">
          {/* Guest: registro = acción primaria */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-dim)] bg-[var(--color-bg-elevated)] p-5 text-center">
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

          {/* Play again — secundario */}
          <button
            onClick={onPlayAgain}
            className="w-full rounded-full border border-[var(--color-border-strong)] py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-text-primary)]"
          >
            {gs.ctaPlayAgain}
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-3">
          {/* Authenticated: play again = acción primaria */}
          <button
            onClick={onPlayAgain}
            className="w-full rounded-full bg-[var(--color-brand)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            {gs.ctaPlayAgain}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
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
  <div className="flex flex-col items-center justify-center gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
    <span
      className={[
        'text-2xl font-bold',
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
