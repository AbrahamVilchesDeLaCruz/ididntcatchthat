import { type ReactElement } from 'react';
import { GamesStatsCards } from './components/GamesStatsCards';
import { GamesByModuleChart } from './components/GamesByModuleChart';
import type { GamesStatsVM } from './backoffice-games.types';

interface BackofficeGamesComponentProps {
  stats: GamesStatsVM;
}

export const BackofficeGamesComponent = ({
  stats,
}: BackofficeGamesComponentProps): ReactElement => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Métricas de partidas
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Estadísticas globales de actividad
        </p>
      </div>

      {/* KPI Cards */}
      <GamesStatsCards stats={stats} />

      {/* Chart */}
      <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
          Partidas por módulo
        </h2>
        {stats.byModule.length === 0 ? (
          <p className="text-[var(--color-text-secondary)] text-sm text-center py-16">
            Sin datos por módulo
          </p>
        ) : (
          <GamesByModuleChart data={stats.byModule} />
        )}
      </div>
    </div>
  );
};
