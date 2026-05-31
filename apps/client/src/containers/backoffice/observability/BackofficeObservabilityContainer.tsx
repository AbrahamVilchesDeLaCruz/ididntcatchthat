import { type ReactElement } from 'react';
import { useObservabilityState } from './hooks';
import { BackofficeObservabilityComponent } from './BackofficeObservabilityComponent';

export const BackofficeObservabilityContainer = (): ReactElement => {
  const { metricsSummary, isLoading, isError } = useObservabilityState();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  if (isError || !metricsSummary.data) {
    return (
      <div className="text-[var(--color-accent-red)] text-center py-16">
        Error al cargar las métricas. Intentalo de nuevo.
      </div>
    );
  }

  return <BackofficeObservabilityComponent summary={metricsSummary.data} />;
};
