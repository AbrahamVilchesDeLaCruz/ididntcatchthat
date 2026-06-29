import { type ReactElement } from 'react';
import { type RuntimeMetrics } from '../utils/parseMetrics';
import {
  InsightCard,
  InsightCardSkeleton,
  type InsightVariant,
} from './InsightCard';

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
      ? 'Sin datos de heap disponibles'
      : heapPct > 85
        ? `Memoria alta — considera aumentar el límite de Node.js`
        : heapPct > 70
          ? `Heap en zona de atención (${heapPct.toFixed(0)}%)`
          : `Memoria en niveles saludables (${heapPct.toFixed(0)}%)`;

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
      ? 'Sin datos de event loop — activa collectDefaultMetrics()'
      : lagMs > 50
        ? `Event loop bloqueado — revisar tareas síncronas pesadas`
        : lagMs > 10
          ? `Cola de eventos con algo de latencia (${lagMs.toFixed(1)}ms)`
          : `Cola de eventos fluida — sin bloqueos detectados`;

  const uptimeSec = runtime.uptimeSeconds;
  const uptimeVariant: InsightVariant =
    uptimeSec !== null && uptimeSec > 86_400 ? 'success' : 'neutral';
  const uptimeInsight =
    uptimeSec === null
      ? 'Sin datos de uptime'
      : uptimeSec > 86_400 * 3
        ? `El servidor lleva ${fmtUptime(uptimeSec)} sin reinicios — estable`
        : uptimeSec > 3_600
          ? `El servidor lleva ${fmtUptime(uptimeSec)} activo`
          : `Servidor arrancado recientemente (${fmtUptime(uptimeSec)})`;

  const gcSec = runtime.gcDurationTotalSeconds;
  const gcVariant: InsightVariant =
    gcSec !== null && gcSec > 60 ? 'warning' : 'success';
  const gcInsight =
    gcSec === null
      ? 'Sin datos de GC'
      : gcSec > 60
        ? `GC acumulado elevado — revisar retención de objetos`
        : `Pausas de GC normales (${gcSec.toFixed(2)}s total)`;

  const noRuntimeData =
    runtime.heapUsedBytes === null &&
    runtime.eventLoopLagP95Ms === null &&
    runtime.uptimeSeconds === null;

  if (noRuntimeData) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-12 text-center">
        <p className="text-[var(--color-text-secondary)] text-sm">
          Sin métricas de runtime —{' '}
          <code className="font-mono text-xs">collectDefaultMetrics()</code> aún
          no ha registrado datos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <InsightCard
          label="Heap usado"
          value={
            heapPct !== null
              ? `${heapPct.toFixed(1)}%`
              : fmtBytes(runtime.heapUsedBytes)
          }
          insight={heapInsight}
          variant={heapVariant}
          progress={heapPct ?? undefined}
          sub={
            runtime.heapUsedBytes && runtime.heapTotalBytes
              ? `${fmtBytes(runtime.heapUsedBytes)} / ${fmtBytes(runtime.heapTotalBytes)}`
              : undefined
          }
        />

        <InsightCard
          label="Event loop lag p95"
          value={lagMs !== null ? `${lagMs.toFixed(1)} ms` : '—'}
          insight={lagInsight}
          variant={lagVariant}
        />

        <InsightCard
          label="Uptime"
          value={fmtUptime(uptimeSec)}
          insight={uptimeInsight}
          variant={uptimeVariant}
        />

        <InsightCard
          label="GC acumulado"
          value={gcSec !== null ? `${gcSec.toFixed(2)} s` : '—'}
          insight={gcInsight}
          variant={gcVariant}
        />

        {runtime.activeHandles !== null && (
          <InsightCard
            label="Handles activos"
            value={String(runtime.activeHandles)}
            insight={`${runtime.activeHandles} handles abiertos (sockets, timers, etc.)`}
            variant="neutral"
          />
        )}

        {runtime.residentMemoryBytes !== null && (
          <InsightCard
            label="Memoria RSS"
            value={fmtBytes(runtime.residentMemoryBytes)}
            insight="Memoria física total usada por el proceso Node.js"
            variant="neutral"
          />
        )}
      </div>
    </div>
  );
};
