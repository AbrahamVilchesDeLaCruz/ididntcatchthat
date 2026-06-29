import { type ReactElement } from 'react';
import { Activity } from 'lucide-react';
import { BackofficePageShell } from '@/common/components/BackofficePageShell';
import {
  HttpSummaryCards,
  SummaryCardSkeleton,
} from './components/HttpSummaryCards';
import { HttpBreakdownTable } from './components/HttpBreakdownTable';
import { RuntimeMetricsSection } from './components/RuntimeMetricsSection';
import { BusinessMetricsSection } from './components/BusinessMetricsSection';
import { UsersStatsSection } from './components/UsersStatsSection';
import { ObservabilityTabs } from './components/ObservabilityTabs';
import {
  parseHttpStats,
  parseLatencyPercentiles,
  parseRuntimeMetrics,
  parseBusinessMetrics,
} from './utils/parseMetrics';
import type { MetricsSummaryVM, UserStatsVM } from './observability.types';

interface BackofficeObservabilityComponentProps {
  summary: MetricsSummaryVM | null;
  userStats: UserStatsVM | null;
  isLoading: boolean;
  isError: boolean;
  isUserStatsLoading: boolean;
  isUserStatsError: boolean;
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
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="h-9 bg-[var(--color-bg-elevated)] rounded" />
    ))}
  </div>
);

export const BackofficeObservabilityComponent = ({
  summary,
  userStats,
  isLoading,
  isError,
  isUserStatsLoading,
  isUserStatsError,
  lastUpdatedAt,
  onRetry,
}: BackofficeObservabilityComponentProps): ReactElement => {
  const metrics = summary?.metrics ?? [];
  const httpStats = parseHttpStats(metrics);
  const latencyStats = parseLatencyPercentiles(metrics);
  const runtimeMetrics = parseRuntimeMetrics(metrics);
  const businessMetrics = parseBusinessMetrics(metrics);

  const httpTab = (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
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
    </div>
  );

  const runtimeTab = (
    <RuntimeMetricsSection
      runtime={isLoading ? null : runtimeMetrics}
      isLoading={isLoading}
    />
  );

  const businessTab = (
    <BusinessMetricsSection
      business={isLoading ? null : businessMetrics}
      isLoading={isLoading}
    />
  );

  const usersTab = (
    <UsersStatsSection
      stats={userStats}
      isLoading={isUserStatsLoading}
      isError={isUserStatsError}
    />
  );

  return (
    <BackofficePageShell
      title="Observabilidad"
      subtitle="Métricas del sistema en tiempo real"
      isError={isError}
      onRetry={onRetry}
      lastUpdatedAt={lastUpdatedAt}
      headerExtra={!isLoading && !isError ? <LiveBadge /> : undefined}
    >
      <ObservabilityTabs
        httpContent={httpTab}
        runtimeContent={runtimeTab}
        businessContent={businessTab}
        usersContent={usersTab}
      />
    </BackofficePageShell>
  );
};
