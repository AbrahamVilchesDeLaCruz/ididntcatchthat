import { type ReactElement } from 'react';
import type { HttpStats, LatencyPercentiles } from '../utils/parseMetrics';

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
  const fmtMs = (ms: number | null): string =>
    ms !== null ? `${ms.toFixed(0)} ms` : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label="Total requests"
        value={http.totalRequests.toLocaleString('es-ES')}
        variant="default"
      />
      <SummaryCard
        label="Tasa de éxito"
        value={`${http.successRate.toFixed(1)}%`}
        sub="respuestas 2xx"
        variant={http.successRate >= 95 ? 'success' : 'warning'}
      />
      <SummaryCard
        label="Tasa de error"
        value={`${http.errorRate.toFixed(2)}%`}
        sub="respuestas 5xx"
        variant={http.errorRate > 1 ? 'danger' : 'success'}
      />
      <SummaryCard
        label="Latencia p95"
        value={fmtMs(latency?.p95Ms ?? null)}
        sub={
          latency
            ? `p50: ${fmtMs(latency.p50Ms)} · p99: ${fmtMs(latency.p99Ms)}`
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
