import { type ReactElement } from 'react';
import { useBackofficeGamesState } from './hooks';
import { BackofficeGamesComponent } from './BackofficeGamesComponent';

export const BackofficeGamesContainer = (): ReactElement => {
  const { gamesStats, isLoading, isError } = useBackofficeGamesState();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  if (isError || !gamesStats.data) {
    return (
      <div className="text-[var(--color-accent-red)] text-center py-16">
        Error al cargar las métricas de partidas. Intentalo de nuevo.
      </div>
    );
  }

  return <BackofficeGamesComponent stats={gamesStats.data} />;
};
