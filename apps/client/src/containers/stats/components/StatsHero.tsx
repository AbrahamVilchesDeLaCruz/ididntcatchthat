import { type ReactElement } from 'react';
import { useI18n } from '@/core/i18n';
import type { ProgressSummaryVM } from '../stats.types';

interface StatsHeroProps {
  summary: ProgressSummaryVM;
}

const KpiCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}): ReactElement => (
  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
    <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    <p className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">
      {value}
    </p>
    {hint ? (
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{hint}</p>
    ) : null}
  </div>
);

export const StatsHero = ({ summary }: StatsHeroProps): ReactElement => {
  const { t } = useI18n();
  const h = t.stats.hero;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        label={h.streak}
        value={String(summary.currentStreak)}
        hint={h.streakHint.replace('{best}', String(summary.longestStreak))}
      />
      <KpiCard
        label={h.accuracy7d}
        value={`${Math.round(summary.accuracy7d)}%`}
      />
      <KpiCard
        label={h.weakCount}
        value={String(summary.weakCount)}
        hint={h.weakHint}
      />
      <KpiCard
        label={h.mastered}
        value={String(summary.masteredCount)}
        hint={h.gamesHint.replace('{count}', String(summary.gamesCompleted))}
      />
    </div>
  );
};
