import { mock } from 'jest-mock-extended';
import { type DbStatsQuery } from '@/analytics/application/db-stats/db-stats.query';
import { DbStatsRetriever } from '@/analytics/application/db-stats/db-stats-retriever';
import type {
  ResponseDbStats,
  StatPeriod,
} from '@/analytics/application/db-stats/db-stats.response';

describe('analytics/application/db-stats DbStatsRetriever', () => {
  const query = mock<DbStatsQuery>();
  let retriever: DbStatsRetriever;

  beforeEach(() => {
    query.execute.mockReset();
    retriever = new DbStatsRetriever(query);
  });

  it('should delegate to DbStatsQuery and return the result', async () => {
    const period: StatPeriod = '7d';
    const expected = { period } as ResponseDbStats;
    query.execute.mockResolvedValue(expected);

    const result = await retriever.execute(period);

    expect(query.execute).toHaveBeenCalledWith(period);
    expect(result).toBe(expected);
  });

  it.each<StatPeriod>(['24h', '7d', '15d', '30d', '6m', 'all'])(
    'should pass period "%s" through to the query',
    async (period) => {
      query.execute.mockResolvedValue({ period } as ResponseDbStats);

      await retriever.execute(period);

      expect(query.execute).toHaveBeenCalledWith(period);
    },
  );
});
