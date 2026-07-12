import { type ReactElement } from 'react';
import {
  GamesStatsCards,
  StatCardSkeleton,
} from './components/GamesStatsCards';
import { GamesByModuleChart } from './components/GamesByModuleChart';
import { ModePieChart } from './components/ModePieChart';
import { ModulesRadarChart } from './components/ModulesRadarChart';
import { BackofficePageShell } from '@/common/components/BackofficePageShell';
import { PeriodSelector } from '@/containers/backoffice/observability/components/PeriodSelector';
import { DailyTrendChart } from '@/containers/backoffice/observability/components/DailyTrendChart';
import type { GamesStatsVM, GameStatsPeriod } from './backoffice-games.types';
import { useI18n } from '@/core/i18n';

const MODULE_KEYS = [
  'random',
  'native_sounds',
  'connected_speech',
  'flow_connectors',
  'real_talk',
] as const;

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
            ariaLabel={t.backoffice.games.charts.trendTitle}
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
              <ModePieChart
                data={(stats?.byMode ?? []).map((m) => ({
                  name: t.backoffice.games.modes[m.mode] ?? m.mode,
                  value: m.count,
                }))}
                height={176}
                ariaLabel={t.backoffice.games.charts.modeDistributionTitle}
              />
            )}
          </ChartCard>

          <ChartCard title={t.backoffice.games.charts.topModulesTitle}>
            {isLoading ? (
              <ChartSkeleton height="h-52" />
            ) : (
              <ModulesRadarChart
                data={MODULE_KEYS.map((key) => {
                  const match = (stats?.byModule ?? []).find(
                    (m) => (m.module ?? 'random') === key,
                  );
                  return {
                    name: t.game.config.modules[key],
                    value: match?.totalGames ?? 0,
                  };
                })}
                height={240}
                ariaLabel={t.backoffice.games.charts.topModulesTitle}
              />
            )}
          </ChartCard>
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
        ) : (
          <GamesByModuleChart data={stats?.byModule ?? []} />
        )}
      </ChartCard>
    </BackofficePageShell>
  );
};
