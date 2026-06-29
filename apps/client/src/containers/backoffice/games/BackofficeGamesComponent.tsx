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
  return (
    <BackofficePageShell
      title="Métricas de partidas"
      subtitle="Calidad, volumen y tendencias"
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
      <ChartCard title="Tendencia de partidas">
        {isLoading ? (
          <ChartSkeleton />
        ) : stats && stats.byPeriod.length > 0 ? (
          <DailyTrendChart
            data={stats.byPeriod}
            series={[
              {
                key: 'started',
                label: 'Iniciadas',
                type: 'bar',
                color: 'var(--color-brand)',
              },
              {
                key: 'completed',
                label: 'Completadas',
                type: 'line',
                color: 'var(--color-accent-green)',
              },
            ]}
            height={240}
          />
        ) : (
          <p className="text-[var(--color-text-secondary)] text-sm text-center py-12">
            Sin datos de tendencia para este período
          </p>
        )}
      </ChartCard>

      {/* ── Distribución por modo + top módulos ──────────────────────────── */}
      {(stats?.byMode.length ?? 0) > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Distribución por modo de juego">
            {isLoading ? (
              <ChartSkeleton height="h-44" />
            ) : (
              <DistributionChart
                data={(stats?.byMode ?? []).map((m) => ({
                  name: m.mode,
                  value: m.count,
                }))}
                height={176}
              />
            )}
          </ChartCard>

          {(stats?.byModule.length ?? 0) > 0 && (
            <ChartCard title="Módulos más jugados">
              {isLoading ? (
                <ChartSkeleton height="h-44" />
              ) : (
                <DistributionChart
                  data={(stats?.byModule ?? [])
                    .slice(0, 6)
                    .map((m) => ({ name: m.module, value: m.totalGames }))}
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
        title="Calidad por módulo"
        action={
          <span className="text-xs text-[var(--color-text-muted)]">
            barras = cantidad · línea = precisión %
          </span>
        }
      >
        {isLoading ? (
          <ChartSkeleton height="h-80" />
        ) : !stats?.byModule.length ? (
          <p className="text-[var(--color-text-secondary)] text-sm text-center py-16">
            Sin datos por módulo
          </p>
        ) : (
          <GamesByModuleChart data={stats.byModule} />
        )}
      </ChartCard>
    </BackofficePageShell>
  );
};
