import { Counter, Registry } from 'prom-client';
import { PrometheusMetricsSummaryQuery } from '@/observability/infrastructure/prometheus-metrics-summary.query';

describe('observability/infrastructure PrometheusMetricsSummaryQuery', () => {
  it('should map registry metrics JSON to the summary response shape', async () => {
    const registry = new Registry();
    const counter = new Counter({
      name: 'test_counter_total',
      help: 'Test counter',
      labelNames: ['method'],
      registers: [registry],
    });
    counter.inc({ method: 'GET' });

    const query = new PrometheusMetricsSummaryQuery(registry);
    const result = await query.execute();

    expect(result.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'test_counter_total',
          help: 'Test counter',
          type: 'counter',
          samples: [{ labels: { method: 'GET' }, value: 1 }],
        }),
      ]),
    );
  });
});
