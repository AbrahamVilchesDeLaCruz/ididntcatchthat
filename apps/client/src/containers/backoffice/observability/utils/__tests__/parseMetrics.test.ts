import { describe, it, expect } from 'vitest';
import type { MetricVM } from '../../observability.types';
import {
  parseHttpStats,
  parseLatencyPercentiles,
  parseRuntimeMetrics,
  parseBusinessMetrics,
  groupMetricsByCategory,
} from '../parseMetrics';

const buildMetric = (
  name: string,
  values: { value: number; labels?: Record<string, string> }[],
  type = 'gauge',
): MetricVM => ({
  name,
  help: `help for ${name}`,
  type,
  samples: values.map((v) => ({ labels: v.labels ?? {}, value: v.value })),
});

describe('parseHttpStats', () => {
  it('returns null when http_requests_total is not present', () => {
    expect(parseHttpStats([])).toBeNull();
  });

  it('returns zeroed stats when http_requests_total has no non-bucket samples', () => {
    const metrics: MetricVM[] = [
      buildMetric('http_requests_total', [
        { value: 5, labels: { le: '1' } }, // bucket label → filtered out
      ]),
    ];

    const stats = parseHttpStats(metrics);
    expect(stats).not.toBeNull();
    expect(stats?.totalRequests).toBe(0);
    expect(stats?.breakdown).toEqual([]);
  });

  it('aggregates total / success / client error / server error counts', () => {
    const metrics: MetricVM[] = [
      buildMetric('http_requests_total', [
        {
          value: 80,
          labels: { status_code: '200', route: '/a', method: 'GET' },
        },
        {
          value: 15,
          labels: { status_code: '404', route: '/b', method: 'GET' },
        },
        {
          value: 5,
          labels: { status_code: '500', route: '/c', method: 'GET' },
        },
      ]),
    ];

    const stats = parseHttpStats(metrics)!;
    expect(stats.totalRequests).toBe(100);
    expect(stats.successRate).toBeCloseTo(80);
    expect(stats.clientErrorRate).toBeCloseTo(15);
    expect(stats.serverErrorRate).toBeCloseTo(5);
    expect(stats.errorRate).toBeCloseTo(5);
    expect(stats.breakdown).toHaveLength(3);
  });

  it('falls back to status/status/code/route/handler/endpoint/path label variants', () => {
    const metrics: MetricVM[] = [
      buildMetric('http_requests_total', [
        { value: 1, labels: { status: '200' } }, // "status"
        { value: 1, labels: { code: '200', handler: '/x' } },
        { value: 1, labels: { status_code: '200', endpoint: '/y' } },
        { value: 1, labels: { status_code: '200', path: '/z' } },
      ]),
    ];

    const stats = parseHttpStats(metrics)!;
    expect(
      stats.breakdown[0].method === '—' || stats.breakdown.length === 4,
    ).toBe(true);
    expect(stats.totalRequests).toBe(4);
  });

  it('classifies "other" status codes via statusClass fallback', () => {
    const metrics: MetricVM[] = [
      buildMetric('http_requests_total', [
        {
          value: 1,
          labels: { status_code: '301', route: '/r', method: 'GET' },
        },
        {
          value: 1,
          labels: { status_code: '999', route: '/r', method: 'GET' },
        },
      ]),
    ];

    const stats = parseHttpStats(metrics)!;
    const r301 = stats.breakdown.find((r) => r.status === '301');
    const r999 = stats.breakdown.find((r) => r.status === '999');
    expect(r301?.statusClass).toBe('3xx');
    expect(r999?.statusClass).toBe('other');
  });
});

describe('parseLatencyPercentiles', () => {
  it('returns null when http_request_duration_seconds is not present', () => {
    expect(parseLatencyPercentiles([])).toBeNull();
  });

  it('returns null when no bucket samples are present', () => {
    const metrics: MetricVM[] = [
      buildMetric('http_request_duration_seconds', [
        { value: 0.05, labels: { method: 'GET' } },
      ]),
    ];

    expect(parseLatencyPercentiles(metrics)).toBeNull();
  });

  it('extracts percentiles from histogram buckets', () => {
    const metrics: MetricVM[] = [
      buildMetric('http_request_duration_seconds', [
        { value: 5, labels: { le: '0.05' } },
        { value: 10, labels: { le: '0.1' } },
        { value: 25, labels: { le: '0.5' } },
        { value: 50, labels: { le: '1' } },
        { value: 99, labels: { le: '2' } },
        { value: 100, labels: { le: '+Inf' } },
      ]),
    ];

    const lat = parseLatencyPercentiles(metrics);
    expect(lat).not.toBeNull();
    expect(lat?.p50Ms).not.toBeNull();
    expect(lat?.p95Ms).not.toBeNull();
    expect(lat?.p99Ms).not.toBeNull();
  });

  it('computes avgMs from sum and count metrics', () => {
    const metrics: MetricVM[] = [
      buildMetric('http_request_duration_seconds', [
        { value: 5, labels: { le: '0.1' } },
        { value: 5, labels: { le: '+Inf' } },
      ]),
      buildMetric('http_request_duration_seconds_sum', [{ value: 1 }]),
      buildMetric('http_request_duration_seconds_count', [{ value: 10 }]),
    ];

    const lat = parseLatencyPercentiles(metrics);
    expect(lat?.avgMs).toBeCloseTo(100); // 1/10 * 1000
  });
});

describe('parseRuntimeMetrics', () => {
  it('returns null-safe primitives when no runtime metrics are present', () => {
    const runtime = parseRuntimeMetrics([]);
    expect(runtime.heapUsedBytes).toBeNull();
    expect(runtime.heapTotalBytes).toBeNull();
    expect(runtime.heapUsedPct).toBeNull();
    expect(runtime.eventLoopLagP95Ms).toBeNull();
    expect(runtime.gcDurationTotalSeconds).toBeNull();
    expect(runtime.processStartTimestamp).toBeNull();
    expect(runtime.uptimeSeconds).toBeNull();
    expect(runtime.activeHandles).toBeNull();
    expect(runtime.cpuSecondsTotal).toBeNull();
    expect(runtime.residentMemoryBytes).toBeNull();
  });

  it('computes heapUsedPct from used/total heap bytes', () => {
    const metrics: MetricVM[] = [
      buildMetric('nodejs_heap_size_used_bytes', [{ value: 50 }]),
      buildMetric('nodejs_heap_size_total_bytes', [{ value: 100 }]),
    ];

    const runtime = parseRuntimeMetrics(metrics);
    expect(runtime.heapUsedBytes).toBe(50);
    expect(runtime.heapTotalBytes).toBe(100);
    expect(runtime.heapUsedPct).toBeCloseTo(50);
  });

  it('returns null heapUsedPct when only one heap metric is present', () => {
    const metrics: MetricVM[] = [
      buildMetric('nodejs_heap_size_used_bytes', [{ value: 50 }]),
    ];

    const runtime = parseRuntimeMetrics(metrics);
    expect(runtime.heapUsedPct).toBeNull();
  });

  it('converts event loop lag seconds to milliseconds', () => {
    const metrics: MetricVM[] = [
      buildMetric('nodejs_eventloop_lag_p95_seconds', [{ value: 0.123 }]),
    ];

    const runtime = parseRuntimeMetrics(metrics);
    expect(runtime.eventLoopLagP95Ms).toBeCloseTo(123, 0);
  });

  it('computes uptime in seconds from process_start_time', () => {
    const tenSecondsAgo = (Date.now() - 10_000) / 1000;
    const metrics: MetricVM[] = [
      buildMetric('process_start_time_seconds', [{ value: tenSecondsAgo }]),
    ];

    const runtime = parseRuntimeMetrics(metrics);
    expect(runtime.processStartTimestamp).not.toBeNull();
    expect(runtime.uptimeSeconds).not.toBeNull();
    expect(runtime.uptimeSeconds!).toBeGreaterThan(0);
  });

  it('aggregates active handles, cpu seconds, and rss memory', () => {
    const metrics: MetricVM[] = [
      buildMetric('nodejs_active_handles_total', [{ value: 5 }, { value: 3 }]),
      buildMetric('process_cpu_seconds_total', [{ value: 2.5 }]),
      buildMetric('process_resident_memory_bytes', [{ value: 1024 }]),
    ];

    const runtime = parseRuntimeMetrics(metrics);
    expect(runtime.activeHandles).toBe(8);
    expect(runtime.cpuSecondsTotal).toBeCloseTo(2.5);
    expect(runtime.residentMemoryBytes).toBe(1024);
  });

  it('aggregates gc duration total seconds', () => {
    const metrics: MetricVM[] = [
      buildMetric('nodejs_gc_duration_seconds_sum', [
        { value: 1.25 },
        { value: 0.75 },
      ]),
    ];

    const runtime = parseRuntimeMetrics(metrics);
    expect(runtime.gcDurationTotalSeconds).toBeCloseTo(2);
  });
});

describe('parseBusinessMetrics', () => {
  it('returns zero/null defaults when no business metrics are present', () => {
    const bm = parseBusinessMetrics([]);
    expect(bm.gamesStarted).toBe(0);
    expect(bm.gamesCompleted).toBe(0);
    expect(bm.completionRate).toBeNull();
    expect(bm.flashcardsCreated).toBe(0);
    expect(bm.audioGenerated).toBe(0);
    expect(bm.audioErrors).toBe(0);
    expect(bm.totalLogins).toBe(0);
    expect(bm.totalRegistrations).toBe(0);
  });

  it('aggregates logins and registrations by provider label', () => {
    const metrics: MetricVM[] = [
      buildMetric('app_auth_logins_total', [
        { value: 5, labels: { provider: 'google' } },
        { value: 3, labels: { provider: 'github' } },
      ]),
      buildMetric('app_auth_registrations_total', [
        { value: 2, labels: { provider: 'google' } },
      ]),
    ];

    const bm = parseBusinessMetrics(metrics);
    expect(bm.loginsByProvider.google).toBe(5);
    expect(bm.loginsByProvider.github).toBe(3);
    expect(bm.registrationsByProvider.google).toBe(2);
    expect(bm.totalLogins).toBe(8);
    expect(bm.totalRegistrations).toBe(2);
  });

  it('handles null provider labels as "unknown"', () => {
    const metrics: MetricVM[] = [
      buildMetric('app_auth_logins_total', [{ value: 4, labels: {} }]),
    ];

    const bm = parseBusinessMetrics(metrics);
    expect(bm.loginsByProvider.unknown).toBe(4);
  });

  it('computes completionRate when games started > 0', () => {
    const metrics: MetricVM[] = [
      buildMetric('app_games_started_total', [{ value: 100 }]),
      buildMetric('app_games_completed_total', [{ value: 75 }]),
    ];

    const bm = parseBusinessMetrics(metrics);
    expect(bm.completionRate).toBeCloseTo(75);
  });

  it('aggregates flashcards_created, audio_generated, audio_errors', () => {
    const metrics: MetricVM[] = [
      buildMetric('app_flashcards_created_total', [{ value: 3 }]),
      buildMetric('app_audio_generated_total', [{ value: 10 }]),
      buildMetric('app_audio_errors_total', [{ value: 1 }]),
    ];

    const bm = parseBusinessMetrics(metrics);
    expect(bm.flashcardsCreated).toBe(3);
    expect(bm.audioGenerated).toBe(10);
    expect(bm.audioErrors).toBe(1);
  });
});

describe('groupMetricsByCategory', () => {
  it('groups metrics by known prefix', () => {
    const metrics: MetricVM[] = [
      buildMetric('http_request_duration_seconds_count', [{ value: 1 }]),
      buildMetric('app_games_started_total', [{ value: 2 }]),
      buildMetric('nodejs_heap_size_used_bytes', [{ value: 3 }]),
    ];

    const grouped = groupMetricsByCategory(metrics);
    expect(grouped.find((g) => g.category === 'HTTP')).toBeDefined();
    expect(grouped.find((g) => g.category === 'Aplicación')).toBeDefined();
    expect(grouped.find((g) => g.category === 'Node.js')).toBeDefined();
  });

  it('falls back to "Sistema" category for unknown prefixes', () => {
    const metrics: MetricVM[] = [
      buildMetric('custom_metric_with_no_prefix', [{ value: 1 }]),
    ];

    const grouped = groupMetricsByCategory(metrics);
    const fallback = grouped.find((g) => g.category === 'Sistema');
    expect(fallback).toBeDefined();
    expect(fallback?.metrics.length).toBe(1);
  });

  it('sorts categories with known prefix first, then Sistema', () => {
    const metrics: MetricVM[] = [
      buildMetric('http_first', [{ value: 1 }]),
      buildMetric('unknown_zzz', [{ value: 1 }]),
      buildMetric('unknown_aaa', [{ value: 1 }]),
    ];

    const grouped = groupMetricsByCategory(metrics);
    // HTTP comes first (it's in the order list), Sistema follows
    expect(grouped[0].category).toBe('HTTP');
    expect(grouped[1].category).toBe('Sistema');
    // Both unknown metrics land in Sistema
    expect(grouped[1].metrics.length).toBe(2);
  });

  it('preserves the canonical category order: HTTP, NestJS, Aplicación, Node.js, Proceso, Sistema', () => {
    const metrics: MetricVM[] = [
      buildMetric('process_x', [{ value: 1 }]),
      buildMetric('nodejs_x', [{ value: 1 }]),
      buildMetric('nestjs_x', [{ value: 1 }]),
      buildMetric('app_x', [{ value: 1 }]),
      buildMetric('http_x', [{ value: 1 }]),
      buildMetric('zzz_unknown', [{ value: 1 }]),
    ]; // → Sistema

    const grouped = groupMetricsByCategory(metrics);
    expect(grouped.map((g) => g.category)).toEqual([
      'HTTP',
      'NestJS',
      'Aplicación',
      'Node.js',
      'Proceso',
      'Sistema',
    ]);
  });
});
