import { type ReactElement } from 'react';
import { Activity } from 'lucide-react';
import { BackofficePageShell } from '@/common/components/BackofficePageShell';
import {
  HttpSummaryCards,
  SummaryCardSkeleton,
} from './components/HttpSummaryCards';
import { HttpBreakdownTable } from './components/HttpBreakdownTable';
import { MetricsGroup } from './components/MetricsGroup';
import {
  parseHttpStats,
  parseLatencyPercentiles,
  groupMetricsByCategory,
} from './utils/parseMetrics';
import type { MetricsSummaryVM } from './observability.types';

interface BackofficeObservabilityComponentProps {
  summary: MetricsSummaryVM | null;
  isLoading: boolean;
  isError: boolean;
  lastUpdatedAt?: number;
  onRetry: () => void;
}

const LiveBadge = (): ReactElement => (
  <span className="flex items-center gap-1.5 text-xs text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10 border border-[var(--color-accent-green)]/20 px-2.5 py-1 rounded-full">
    <Activity className="w-3 h-3" />
    live · 30 s
  </span>
);

const TableSkeleton = (): ReactElement => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-9 bg-[var(--color-bg-elevated)] rounded" />
    ))}
  </div>
);

export const BackofficeObservabilityComponent = ({
  summary,
  isLoading,
  isError,
  lastUpdatedAt,
  onRetry,
}: BackofficeObservabilityComponentProps): ReactElement => {
  const metrics = summary?.metrics ?? [];
  const httpStats = parseHttpStats(metrics);
  const latencyStats = parseLatencyPercentiles(metrics);
  const groups = groupMetricsByCategory(metrics);
  const nonHttpGroups = groups.filter((g) => g.category !== 'HTTP');

  return (
    <BackofficePageShell
      title="Observabilidad"
      subtitle="Métricas del sistema en tiempo real"
      isError={isError}
      onRetry={onRetry}
      lastUpdatedAt={lastUpdatedAt}
      headerExtra={!isLoading && !isError ? <LiveBadge /> : undefined}
    >
      {/* HTTP Summary KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SummaryCardSkeleton key={i} />
          ))}
        </div>
      ) : httpStats ? (
        <HttpSummaryCards http={httpStats} latency={latencyStats} />
      ) : (
        <p className="text-[var(--color-text-secondary)] text-sm">
          Sin datos HTTP disponibles
        </p>
      )}

      {/* HTTP Breakdown by endpoint */}
      <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
          Requests por endpoint
        </h2>
        {isLoading ? (
          <TableSkeleton />
        ) : httpStats ? (
          <HttpBreakdownTable
            rows={httpStats.breakdown}
            totalRequests={httpStats.totalRequests}
          />
        ) : (
          <p className="text-[var(--color-text-secondary)] text-sm text-center py-8">
            Sin datos de requests HTTP
          </p>
        )}
      </div>

      {/* All other metric groups */}
      {!isLoading && nonHttpGroups.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Todas las métricas
          </h2>
          {groups.map(({ category, metrics: groupMetrics }) => (
            <MetricsGroup
              key={category}
              category={category}
              metrics={groupMetrics}
              defaultOpen={category === 'HTTP'}
            />
          ))}
        </div>
      )}
    </BackofficePageShell>
  );
};
