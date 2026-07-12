import { type ReactElement } from 'react';
import { type RuntimeMetrics } from '../utils/parseMetrics';
import {
  InsightCard,
  InsightCardSkeleton,
  type InsightVariant,
} from './InsightCard';
import { useI18n } from '@/core/i18n';

interface RuntimeMetricsSectionProps {
  runtime: RuntimeMetrics | null;
  isLoading: boolean;
}

function fmtBytes(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_024).toFixed(0)} KB`;
}

function fmtUptime(seconds: number | null): string {
  if (seconds === null) return '—';
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export const RuntimeMetricsSection = ({
  runtime,
  isLoading,
}: RuntimeMetricsSectionProps): ReactElement => {
  const { t } = useI18n();

  if (isLoading || !runtime) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <InsightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const heapPct = runtime.heapUsedPct;
  const heapVariant: InsightVariant =
    heapPct === null
      ? 'neutral'
      : heapPct > 85
        ? 'danger'
        : heapPct > 70
          ? 'warning'
          : 'success';
  const heapInsight =
    heapPct === null
      ? t.backoffice.observability.runtime.noHeapData
      : heapPct > 85
        ? t.backoffice.observability.runtime.highMemoryHint
        : heapPct > 70
          ? t.backoffice.observability.runtime.warningHeapHint.replace(
              '{percent}',
              heapPct.toFixed(0),
            )
          : t.backoffice.observability.runtime.healthyMemoryHint.replace(
              '{percent}',
              heapPct.toFixed(0),
            );

  const lagMs = runtime.eventLoopLagP95Ms;
  const lagVariant: InsightVariant =
    lagMs === null
      ? 'neutral'
      : lagMs > 50
        ? 'danger'
        : lagMs > 10
          ? 'warning'
          : 'success';
  const lagInsight =
    lagMs === null
      ? t.backoffice.observability.runtime.noEventLoopData
      : lagMs > 50
        ? t.backoffice.observability.runtime.blockedEventLoopHint
        : lagMs > 10
          ? t.backoffice.observability.runtime.warningEventLoopHint.replace(
              '{ms}',
              lagMs.toFixed(1),
            )
          : t.backoffice.observability.runtime.healthyEventLoopHint;

  const uptimeSec = runtime.uptimeSeconds;
  const uptimeVariant: InsightVariant =
    uptimeSec !== null && uptimeSec > 86_400 ? 'success' : 'neutral';
  const uptimeInsight =
    uptimeSec === null
      ? t.backoffice.observability.runtime.noUptimeData
      : uptimeSec > 86_400 * 3
        ? t.backoffice.observability.runtime.stableServerHint.replace(
            '{value}',
            fmtUptime(uptimeSec),
          )
        : uptimeSec > 3_600
          ? t.backoffice.observability.runtime.activeServerHint.replace(
              '{value}',
              fmtUptime(uptimeSec),
            )
          : t.backoffice.observability.runtime.recentServerHint.replace(
              '{value}',
              fmtUptime(uptimeSec),
            );

  const gcSec = runtime.gcDurationTotalSeconds;
  const gcVariant: InsightVariant =
    gcSec !== null && gcSec > 60 ? 'warning' : 'success';
  const gcInsight =
    gcSec === null
      ? t.backoffice.observability.runtime.noGcData
      : gcSec > 60
        ? t.backoffice.observability.runtime.highGcHint
        : t.backoffice.observability.runtime.normalGcHint.replace(
            '{value}',
            gcSec.toFixed(2),
          );

  const noRuntimeData =
    runtime.heapUsedBytes === null &&
    runtime.eventLoopLagP95Ms === null &&
    runtime.uptimeSeconds === null;

  if (noRuntimeData) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-12 text-center">
        <p className="text-[var(--color-text-secondary)] text-sm">
          {t.backoffice.observability.runtime.noRuntimeMetrics}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <InsightCard
          label={t.backoffice.observability.runtime.heapUsed}
          value={
            heapPct !== null
              ? `${heapPct.toFixed(1)}%`
              : fmtBytes(runtime.heapUsedBytes)
          }
          insight={heapInsight}
          variant={heapVariant}
          progress={heapPct ?? undefined}
          tooltip={t.backoffice.observability.runtime.heapUsedTooltip}
          sub={
            runtime.heapUsedBytes && runtime.heapTotalBytes
              ? `${fmtBytes(runtime.heapUsedBytes)} / ${fmtBytes(runtime.heapTotalBytes)}`
              : undefined
          }
        />

        <InsightCard
          label={t.backoffice.observability.runtime.eventLoopLagP95}
          value={lagMs !== null ? `${lagMs.toFixed(1)} ms` : '—'}
          insight={lagInsight}
          variant={lagVariant}
          tooltip={t.backoffice.observability.runtime.eventLoopLagP95Tooltip}
        />

        <InsightCard
          label={t.backoffice.observability.runtime.uptime}
          value={fmtUptime(uptimeSec)}
          insight={uptimeInsight}
          variant={uptimeVariant}
          tooltip={t.backoffice.observability.runtime.uptimeTooltip}
        />

        <InsightCard
          label={t.backoffice.observability.runtime.gcTotal}
          value={gcSec !== null ? `${gcSec.toFixed(2)} s` : '—'}
          insight={gcInsight}
          variant={gcVariant}
          tooltip={t.backoffice.observability.runtime.gcTotalTooltip}
        />

        {runtime.activeHandles !== null && (
          <InsightCard
            label={t.backoffice.observability.runtime.activeHandles}
            value={String(runtime.activeHandles)}
            insight={t.backoffice.observability.runtime.activeHandlesHint.replace(
              '{count}',
              String(runtime.activeHandles),
            )}
            variant="neutral"
            tooltip={t.backoffice.observability.runtime.activeHandlesTooltip}
          />
        )}

        {runtime.residentMemoryBytes !== null && (
          <InsightCard
            label={t.backoffice.observability.runtime.rssMemory}
            value={fmtBytes(runtime.residentMemoryBytes)}
            insight={t.backoffice.observability.runtime.rssMemoryHint}
            variant="neutral"
            tooltip={t.backoffice.observability.runtime.rssMemoryTooltip}
          />
        )}
      </div>
    </div>
  );
};
