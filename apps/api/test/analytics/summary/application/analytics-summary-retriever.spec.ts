import { mock } from 'jest-mock-extended';
import { type AnalyticsSummaryQuery } from '@/analytics/summary/application/analytics-summary.query';
import { AnalyticsSummaryRetriever } from '@/analytics/summary/application/analytics-summary-retriever';
import { type ResponseAnalyticsSummaryRetriever } from '@/analytics/summary/application/response-analytics-summary-retriever';

describe('analytics/summary/application AnalyticsSummaryRetriever', () => {
  const query = mock<AnalyticsSummaryQuery>();
  let retriever: AnalyticsSummaryRetriever;

  beforeEach(() => {
    query.execute.mockReset();
    retriever = new AnalyticsSummaryRetriever(query);
  });

  it('should delegate to AnalyticsSummaryQuery and return the result', async () => {
    const period = '7d' as const;
    const expected = { period } as ResponseAnalyticsSummaryRetriever;
    query.execute.mockResolvedValue(expected);

    const result = await retriever.execute(period);

    expect(query.execute).toHaveBeenCalledWith('7d');
    expect(result).toBe(expected);
  });

  it.each(['24h', '15d', '30d', '6m', 'all'] as const)(
    'should forward period %s unchanged',
    async (period) => {
      query.execute.mockResolvedValue({
        period,
      } as ResponseAnalyticsSummaryRetriever);

      await retriever.execute(period);

      expect(query.execute).toHaveBeenCalledWith(period);
    },
  );
});
