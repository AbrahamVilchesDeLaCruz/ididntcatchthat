import { type ReactElement } from 'react';
import { Activity } from 'lucide-react';
import { BackofficePageShell } from '@/common/components/BackofficePageShell';
import {
  HttpSummaryCards,
  SummaryCardSkeleton,
} from './components/HttpSummaryCards';
import { HttpBreakdownTable } from './components/HttpBreakdownTable';
import { RuntimeMetricsSection } from './components/RuntimeMetricsSection';
import { ObservabilityTabs } from './components/ObservabilityTabs';
import {
  parseHttpStats,
  parseLatencyPercentiles,
  parseRuntimeMetrics,
} from './utils/parseMetrics';
import type { MetricsSummaryVM } from './observability.types';
import { useI18n } from '@/core/i18n';

interface BackofficeObservabilityComponentProps {
  summary: MetricsSummaryVM | null;
  isLoading: boolean;
  isError: boolean;
  lastUpdatedAt?: number;
  onRetry: () => void;
}

const TableSkeleton = (): ReactElement => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: 5 }, (_, i) => (
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
  const { locale, t } = useI18n();
  const numberLocale = locale === 'es' ? 'es-ES' : 'en-US';
  const dateLocale = locale === 'es' ? 'es-ES' : 'en-US';

  const metrics = summary?.metrics ?? [];
  const httpStats = parseHttpStats(metrics);
  const latencyStats = parseLatencyPercentiles(metrics);
  const runtimeMetrics = parseRuntimeMetrics(metrics);
  const serverStartedAt = runtimeMetrics.processStartTimestamp;
  const serverStartLabel = serverStartedAt
    ? new Date(serverStartedAt).toLocaleString(dateLocale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const httpTab = (
    <div className="space-y-6">
      {serverStartLabel && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2.5 text-xs text-[var(--color-text-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] shrink-0" />
          {t.backoffice.observability.serverSincePrefix}{' '}
          <span className="font-medium text-[var(--color-text-secondary)]">
            {serverStartLabel}
          </span>
          <span className="ml-auto text-[var(--color-text-muted)]">
            {t.backoffice.observability.serverScopeLabel}
          </span>
        </div>
      )}

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
          {t.backoffice.observability.noHttpData}
        </p>
      )}

      <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-6">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {t.backoffice.observability.requestsByEndpoint}
          </h2>
          {!isLoading && httpStats && (
            <span className="text-xs text-[var(--color-text-muted)]">
              {httpStats.totalRequests.toLocaleString(numberLocale)}{' '}
              {t.backoffice.observability.totalRequestsSuffix}
            </span>
          )}
        </div>
        {isLoading ? (
          <TableSkeleton />
        ) : httpStats ? (
          <HttpBreakdownTable
            rows={httpStats.breakdown}
            totalRequests={httpStats.totalRequests}
          />
        ) : (
          <p className="text-[var(--color-text-secondary)] text-sm text-center py-8">
            {t.backoffice.observability.noHttpRequestData}
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

  return (
    <BackofficePageShell
      title={t.backoffice.observability.title}
      subtitle={t.backoffice.observability.subtitle}
      isError={isError}
      onRetry={onRetry}
      lastUpdatedAt={lastUpdatedAt}
      headerExtra={
        !isLoading && !isError ? (
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10 border border-[var(--color-accent-green)]/20 px-2.5 py-1 rounded-full">
            <Activity className="w-3 h-3" />
            {t.backoffice.observability.liveBadge}
          </span>
        ) : undefined
      }
    >
      <ObservabilityTabs httpContent={httpTab} runtimeContent={runtimeTab} />
    </BackofficePageShell>
  );
};
