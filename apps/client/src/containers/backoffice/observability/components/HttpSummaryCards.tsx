import { type ReactElement } from 'react';
import type { HttpStats, LatencyPercentiles } from '../utils/parseMetrics';
import { useI18n } from '@/core/i18n';

interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const VARIANT_CLASSES: Record<
  NonNullable<SummaryCardProps['variant']>,
  string
> = {
  default: 'text-[var(--color-text-primary)]',
  success: 'text-[var(--color-accent-green)]',
  warning: 'text-[var(--color-brand)]',
  danger: 'text-[var(--color-accent-red)]',
};

const SummaryCard = ({
  label,
  value,
  sub,
  variant = 'default',
}: SummaryCardProps): ReactElement => (
  <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5">
    <p className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wide mb-2">
      {label}
    </p>
    <p
      className={`text-3xl font-bold tracking-tight ${VARIANT_CLASSES[variant]}`}
    >
      {value}
    </p>
    {sub && (
      <p className="text-xs text-[var(--color-text-muted)] mt-1">{sub}</p>
    )}
  </div>
);

export const SummaryCardSkeleton = (): ReactElement => (
  <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 animate-pulse">
    <div className="h-3 w-20 bg-[var(--color-bg-elevated)] rounded mb-3" />
    <div className="h-8 w-16 bg-[var(--color-bg-elevated)] rounded mb-2" />
    <div className="h-3 w-24 bg-[var(--color-bg-elevated)] rounded" />
  </div>
);

interface HttpSummaryCardsProps {
  http: HttpStats;
  latency: LatencyPercentiles | null;
}

export const HttpSummaryCards = ({
  http,
  latency,
}: HttpSummaryCardsProps): ReactElement => {
  const { locale, t } = useI18n();
  const numberLocale = locale === 'es' ? 'es-ES' : 'en-US';

  const fmtMs = (ms: number | null): string =>
    ms !== null ? `${ms.toFixed(0)} ms` : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label={t.backoffice.observability.httpSummary.totalRequests}
        value={http.totalRequests.toLocaleString(numberLocale)}
        variant="default"
      />
      <SummaryCard
        label={t.backoffice.observability.httpSummary.successRate}
        value={`${http.successRate.toFixed(1)}%`}
        sub={t.backoffice.observability.httpSummary.successRateHint}
        variant={http.successRate >= 95 ? 'success' : 'warning'}
      />
      <SummaryCard
        label={t.backoffice.observability.httpSummary.errorRate}
        value={`${http.errorRate.toFixed(2)}%`}
        sub={t.backoffice.observability.httpSummary.errorRateHint}
        variant={http.errorRate > 1 ? 'danger' : 'success'}
      />
      <SummaryCard
        label={t.backoffice.observability.httpSummary.latencyP95}
        value={fmtMs(latency?.p95Ms ?? null)}
        sub={
          latency
            ? t.backoffice.observability.httpSummary.latencyDetail
                .replace('{p50}', fmtMs(latency.p50Ms))
                .replace('{p99}', fmtMs(latency.p99Ms))
            : undefined
        }
        variant={
          latency?.p95Ms === undefined || latency.p95Ms === null
            ? 'default'
            : latency.p95Ms > 500
              ? 'danger'
              : latency.p95Ms > 200
                ? 'warning'
                : 'success'
        }
      />
    </div>
  );
};
