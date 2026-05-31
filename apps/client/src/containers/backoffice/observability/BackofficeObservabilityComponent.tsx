import { type ReactElement } from 'react';
import { MetricsTable } from './components/MetricsTable';
import type { MetricsSummaryVM } from './observability.types';

interface BackofficeObservabilityComponentProps {
  summary: MetricsSummaryVM;
}

export const BackofficeObservabilityComponent = ({
  summary,
}: BackofficeObservabilityComponentProps): ReactElement => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Observabilidad
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Métricas del sistema — actualización cada 30 s
        </p>
      </div>

      {/* Metrics */}
      <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
          HTTP Metrics
        </h2>
        <MetricsTable metrics={summary.metrics} />
      </div>
    </div>
  );
};
