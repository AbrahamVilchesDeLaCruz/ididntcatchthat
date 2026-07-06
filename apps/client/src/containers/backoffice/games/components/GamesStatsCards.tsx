import { type ReactElement } from 'react';
import type { GamesStatsVM } from '../backoffice-games.types';
import { useI18n } from '@/core/i18n';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

const StatCard = ({
  label,
  value,
  sub,
  accent,
}: StatCardProps): ReactElement => (
  <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5">
    <p className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wide mb-2">
      {label}
    </p>
    <p
      className={`text-3xl font-bold tracking-tight ${
        accent
          ? 'text-[var(--color-brand)]'
          : 'text-[var(--color-text-primary)]'
      }`}
    >
      {value}
    </p>
    {sub && (
      <p className="text-xs text-[var(--color-text-muted)] mt-1">{sub}</p>
    )}
  </div>
);

/** Skeleton placeholder matching StatCard dimensions */
export const StatCardSkeleton = (): ReactElement => (
  <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 animate-pulse">
    <div className="h-3 w-24 bg-[var(--color-bg-elevated)] rounded mb-3" />
    <div className="h-8 w-16 bg-[var(--color-bg-elevated)] rounded mb-2" />
    <div className="h-3 w-20 bg-[var(--color-bg-elevated)] rounded" />
  </div>
);

interface GamesStatsCardsProps {
  stats: GamesStatsVM;
}

export const GamesStatsCards = ({
  stats,
}: GamesStatsCardsProps): ReactElement => {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'es' ? 'es-ES' : 'en-US';

  const completionRate =
    stats.totalGames > 0 ? stats.completionRate.toFixed(1) : '—';

  const attemptsPerGame =
    stats.totalGames > 0
      ? (stats.totalAttempts / stats.totalGames).toFixed(1)
      : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatCard
        label={t.backoffice.games.kpi.totalGames}
        value={stats.totalGames.toLocaleString(numberLocale)}
        sub={`${stats.completedGames.toLocaleString(numberLocale)} ${t.backoffice.games.kpi.completedGames}`}
      />
      <StatCard
        label={t.backoffice.games.kpi.completionRate}
        value={`${completionRate}%`}
        sub={`${stats.completedGames.toLocaleString(numberLocale)} / ${stats.totalGames.toLocaleString(numberLocale)}`}
        accent={Number(completionRate) >= 70}
      />
      <StatCard
        label={t.backoffice.games.kpi.avgAccuracy}
        value={`${stats.avgAccuracy.toFixed(1)}%`}
        sub={t.backoffice.games.kpi.avgAccuracyHint}
        accent={stats.avgAccuracy >= 80}
      />
      <StatCard
        label={t.backoffice.games.kpi.totalAttempts}
        value={stats.totalAttempts.toLocaleString(numberLocale)}
        sub={`≈ ${attemptsPerGame} ${t.backoffice.games.kpi.attemptsPerGame}`}
      />
      <StatCard
        label={t.backoffice.games.kpi.abandonedGames}
        value={(stats.totalGames - stats.completedGames).toLocaleString(
          numberLocale,
        )}
        sub={`${(100 - Number(completionRate)).toFixed(1)}% ${t.backoffice.games.kpi.totalPercent}`}
      />
    </div>
  );
};
