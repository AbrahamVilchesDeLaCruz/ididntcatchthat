import type { MetricVM } from '../observability.types';

// ─── HTTP requests ─────────────────────────────────────────────────────────────

export interface HttpBreakdownRow {
  handler: string;
  method: string;
  status: string;
  count: number;
  statusClass: '2xx' | '3xx' | '4xx' | '5xx' | 'other';
}

export interface HttpStats {
  totalRequests: number;
  errorRate: number;
  successRate: number;
  breakdown: HttpBreakdownRow[];
}

function statusClass(status: string): HttpBreakdownRow['statusClass'] {
  if (status.startsWith('2')) return '2xx';
  if (status.startsWith('3')) return '3xx';
  if (status.startsWith('4')) return '4xx';
  if (status.startsWith('5')) return '5xx';
  return 'other';
}

export function parseHttpStats(metrics: MetricVM[]): HttpStats | null {
  const m = metrics.find((x) => x.name === 'http_requests_total');
  if (!m) return null;

  // Exclude histogram bucket samples (they have a `le` label)
  const samples = m.samples.filter((s) => !('le' in s.labels));
  const totalRequests = samples.reduce((sum, s) => sum + s.value, 0);

  if (totalRequests === 0) {
    return { totalRequests: 0, errorRate: 0, successRate: 0, breakdown: [] };
  }

  const errorRequests = samples
    .filter((s) => (s.labels.status ?? s.labels.code ?? '').startsWith('5'))
    .reduce((sum, s) => sum + s.value, 0);

  const successRequests = samples
    .filter((s) => (s.labels.status ?? s.labels.code ?? '').startsWith('2'))
    .reduce((sum, s) => sum + s.value, 0);

  const breakdown: HttpBreakdownRow[] = samples
    .map((s) => {
      const status = s.labels.status ?? s.labels.code ?? '—';
      return {
        handler: s.labels.handler ?? s.labels.endpoint ?? s.labels.path ?? '—',
        method: s.labels.method ?? '—',
        status,
        count: s.value,
        statusClass: statusClass(status),
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    totalRequests,
    errorRate: (errorRequests / totalRequests) * 100,
    successRate: (successRequests / totalRequests) * 100,
    breakdown,
  };
}

// ─── Latency (histogram) ───────────────────────────────────────────────────────

export interface LatencyPercentiles {
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  avgMs: number | null;
}

export function parseLatencyPercentiles(
  metrics: MetricVM[],
): LatencyPercentiles | null {
  const m = metrics.find((x) =>
    x.name.includes('http_request_duration_seconds'),
  );
  if (!m) return null;

  // Bucket samples have `le` label; aggregate across all handlers
  const buckets = m.samples
    .filter((s) => 'le' in s.labels)
    .reduce<Map<number, number>>((acc, s) => {
      const le = s.labels.le === '+Inf' ? Infinity : Number(s.labels.le);
      acc.set(le, (acc.get(le) ?? 0) + s.value);
      return acc;
    }, new Map());

  if (buckets.size === 0) return null;

  const sorted = [...buckets.entries()].sort(([a], [b]) => a - b);
  const totalCount = sorted[sorted.length - 1]?.[1] ?? 0;

  if (totalCount === 0) return null;

  const findPercentile = (p: number): number | null => {
    const target = totalCount * p;
    const entry = sorted.find(([, count]) => count >= target);
    if (!entry || entry[0] === Infinity) return null;
    return entry[0] * 1000; // seconds → ms
  };

  // avgMs from _sum / _count if available as unlabelled samples
  const sumSamples = m.samples.filter(
    (s) => !('le' in s.labels) && !('quantile' in s.labels),
  );
  const totalSum = sumSamples.reduce((acc, s) => acc + s.value, 0);
  const avgMs =
    totalSum > 0 && totalCount > 0 ? (totalSum / totalCount) * 1000 : null;

  return {
    p50Ms: findPercentile(0.5),
    p95Ms: findPercentile(0.95),
    p99Ms: findPercentile(0.99),
    avgMs,
  };
}

// ─── Metric grouping ──────────────────────────────────────────────────────────

const CATEGORY_PREFIXES: Array<{ prefix: string; label: string }> = [
  { prefix: 'http_', label: 'HTTP' },
  { prefix: 'nodejs_', label: 'Node.js' },
  { prefix: 'process_', label: 'Proceso' },
  { prefix: 'nestjs_', label: 'NestJS' },
  { prefix: 'app_', label: 'Aplicación' },
];

export function groupMetricsByCategory(
  metrics: MetricVM[],
): Array<{ category: string; metrics: MetricVM[] }> {
  const grouped = new Map<string, MetricVM[]>();

  for (const metric of metrics) {
    const match = CATEGORY_PREFIXES.find(({ prefix }) =>
      metric.name.startsWith(prefix),
    );
    const category = match?.label ?? 'Sistema';
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category)!.push(metric);
  }

  // Keep HTTP first, then alphabetical
  const order = [
    'HTTP',
    'NestJS',
    'Aplicación',
    'Node.js',
    'Proceso',
    'Sistema',
  ];
  return [...grouped.entries()]
    .sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    })
    .map(([category, metrics]) => ({ category, metrics }));
}
