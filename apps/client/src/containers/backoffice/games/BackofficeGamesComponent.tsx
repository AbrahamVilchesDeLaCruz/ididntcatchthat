import { type ReactElement } from 'react';
import {
  GamesStatsCards,
  StatCardSkeleton,
} from './components/GamesStatsCards';
import { GamesByModuleChart } from './components/GamesByModuleChart';
import { BackofficePageShell } from '@/common/components/BackofficePageShell';
import type { GamesStatsVM } from './backoffice-games.types';

interface BackofficeGamesComponentProps {
  stats: GamesStatsVM | null;
  isLoading: boolean;
  isError: boolean;
  lastUpdatedAt?: number;
  onRetry: () => void;
}

const ChartSkeleton = (): ReactElement => (
  <div className="w-full h-80 bg-[var(--color-bg-elevated)] rounded-lg animate-pulse" />
);

export const BackofficeGamesComponent = ({
  stats,
  isLoading,
  isError,
  lastUpdatedAt,
  onRetry,
}: BackofficeGamesComponentProps): ReactElement => {
  return (
    <BackofficePageShell
      title="Métricas de partidas"
      subtitle="Estadísticas globales de actividad"
      isError={isError}
      onRetry={onRetry}
      lastUpdatedAt={lastUpdatedAt}
    >
      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        stats && <GamesStatsCards stats={stats} />
      )}

      {/* Chart */}
      <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Partidas por módulo
          </h2>
          <span className="text-xs text-[var(--color-text-muted)]">
            barras = cantidad · línea = precisión %
          </span>
        </div>

        {isLoading ? (
          <ChartSkeleton />
        ) : !stats?.byModule.length ? (
          <p className="text-[var(--color-text-secondary)] text-sm text-center py-16">
            Sin datos por módulo
          </p>
        ) : (
          <GamesByModuleChart data={stats.byModule} />
        )}
      </div>
    </BackofficePageShell>
  );
};
