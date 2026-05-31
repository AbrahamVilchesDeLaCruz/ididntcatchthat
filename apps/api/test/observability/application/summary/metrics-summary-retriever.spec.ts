import { mock } from 'jest-mock-extended';
import { type MetricsSummaryQuery } from '@/observability/application/summary/metrics-summary.query';
import { MetricsSummaryRetriever } from '@/observability/application/summary/metrics-summary-retriever';
import { type ResponseMetricsSummaryRetriever } from '@/observability/application/summary/response-metrics-summary-retriever';

describe('observability/application/summary MetricsSummaryRetriever', () => {
  const query = mock<MetricsSummaryQuery>();
  let retriever: MetricsSummaryRetriever;

  beforeEach(() => {
    query.execute.mockReset();
    retriever = new MetricsSummaryRetriever(query);
  });

  it('should return the result from the query', async () => {
    const expected: ResponseMetricsSummaryRetriever = {
      metrics: [
        {
          name: 'http_requests_total',
          help: 'Total HTTP requests',
          type: 'counter',
          samples: [{ labels: { method: 'GET', status: '200' }, value: 42 }],
        },
      ],
    };
    query.execute.mockResolvedValue(expected);

    const result = await retriever.execute();

    expect(result).toEqual(expected);
    expect(query.execute).toHaveBeenCalledTimes(1);
  });
});
