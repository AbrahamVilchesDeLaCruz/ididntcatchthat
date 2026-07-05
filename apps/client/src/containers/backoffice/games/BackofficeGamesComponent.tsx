import { type ReactElement } from 'react';
import {
  GamesStatsCards,
  StatCardSkeleton,
} from './components/GamesStatsCards';
import { GamesByModuleChart } from './components/GamesByModuleChart';
import { BackofficePageShell } from '@/common/components/BackofficePageShell';
import { PeriodSelector } from '@/containers/backoffice/observability/components/PeriodSelector';
import { DailyTrendChart } from '@/containers/backoffice/observability/components/DailyTrendChart';
import { DistributionChart } from '@/containers/backoffice/observability/components/DistributionChart';
import type { GamesStatsVM, GameStatsPeriod } from './backoffice-games.types';
import { useI18n } from '@/core/i18n';

interface BackofficeGamesComponentProps {
  stats: GamesStatsVM | null;
  period: GameStatsPeriod;
  onPeriodChange: (p: GameStatsPeriod) => void;
  isLoading: boolean;
  isError: boolean;
  lastUpdatedAt?: number;
  onRetry: () => void;
}

const ChartSkeleton = ({
  height = 'h-60',
}: {
  height?: string;
}): ReactElement => (
  <div
    className={`w-full ${height} bg-[var(--color-bg-elevated)] rounded-lg animate-pulse`}
  />
);

const ChartCard = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactElement;
  children: ReactElement;
}): ReactElement => (
  <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
        {title}
      </h2>
      {action}
    </div>
    {children}
  </div>
);

export const BackofficeGamesComponent = ({
  stats,
  period,
  onPeriodChange,
  isLoading,
  isError,
  lastUpdatedAt,
  onRetry,
}: BackofficeGamesComponentProps): ReactElement => {
  const { t } = useI18n();

  return (
    <BackofficePageShell
      title={t.backoffice.games.title}
      subtitle={t.backoffice.games.subtitle}
      isError={isError}
      onRetry={onRetry}
      lastUpdatedAt={lastUpdatedAt}
      headerExtra={<PeriodSelector value={period} onChange={onPeriodChange} />}
    >
      {/* ── KPIs globales del período ────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        stats && <GamesStatsCards stats={stats} />
      )}

      {/* ── Tendencia temporal ────────────────────────────────────────────── */}
      <ChartCard title={t.backoffice.games.charts.trendTitle}>
        {isLoading ? (
          <ChartSkeleton />
        ) : stats && stats.byPeriod.length > 0 ? (
          <DailyTrendChart
            data={stats.byPeriod}
            series={[
              {
                key: 'started',
                label: t.backoffice.games.charts.started,
                type: 'bar',
                color: 'var(--color-brand)',
              },
              {
                key: 'completed',
                label: t.backoffice.games.charts.completed,
                type: 'line',
                color: 'var(--color-accent-green)',
              },
            ]}
            height={240}
          />
        ) : (
          <p className="text-[var(--color-text-secondary)] text-sm text-center py-12">
            {t.backoffice.games.charts.noTrendData}
          </p>
        )}
      </ChartCard>

      {/* ── Distribución por modo + top módulos ──────────────────────────── */}
      {(stats?.byMode.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={t.backoffice.games.charts.modeDistributionTitle}>
            {isLoading ? (
              <ChartSkeleton height="h-44" />
            ) : (
              <DistributionChart
                data={(stats?.byMode ?? []).map((m) => ({
                  name: t.backoffice.games.modes[m.mode] ?? m.mode,
                  value: m.count,
                }))}
                height={176}
              />
            )}
          </ChartCard>

          {(stats?.byModule.length ?? 0) > 0 && (
            <ChartCard title={t.backoffice.games.charts.topModulesTitle}>
              {isLoading ? (
                <ChartSkeleton height="h-44" />
              ) : (
                <DistributionChart
                  data={(stats?.byModule ?? []).slice(0, 6).map((m) => ({
                    name:
                      t.game.config.modules[
                        m.module as keyof typeof t.game.config.modules
                      ] ?? m.module,
                    value: m.totalGames,
                  }))}
                  height={Math.max(
                    176,
                    (stats?.byModule.slice(0, 6).length ?? 0) * 32,
                  )}
                  horizontal
                />
              )}
            </ChartCard>
          )}
        </div>
      )}

      {/* ── Calidad por módulo (accuracy) ────────────────────────────────── */}
      <ChartCard
        title={t.backoffice.games.charts.qualityByModuleTitle}
        action={
          <span className="text-xs text-[var(--color-text-muted)]">
            {t.backoffice.games.charts.qualityByModuleHint}
          </span>
        }
      >
        {isLoading ? (
          <ChartSkeleton height="h-80" />
        ) : !stats?.byModule.length ? (
          <p className="text-[var(--color-text-secondary)] text-sm text-center py-16">
            {t.backoffice.games.charts.noModuleData}
          </p>
        ) : (
          <GamesByModuleChart data={stats.byModule} />
        )}
      </ChartCard>
    </BackofficePageShell>
  );
};
