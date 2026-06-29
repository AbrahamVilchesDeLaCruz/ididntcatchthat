import { mock } from 'jest-mock-extended';
import {
  type UserStatsQuery,
  type UserStatPeriod,
} from '@/identity/user/application/stats/user-stats.query';
import { UserStatsRetriever } from '@/identity/user/application/stats/user-stats-retriever';
import type { ResponseUserStatsRetriever } from '@/identity/user/application/stats/response-user-stats-retriever';

describe('identity/user/application/stats UserStatsRetriever', () => {
  const query = mock<UserStatsQuery>();
  let retriever: UserStatsRetriever;

  beforeEach(() => {
    query.execute.mockReset();
    retriever = new UserStatsRetriever(query);
  });

  it('should delegate to UserStatsQuery and return the result', async () => {
    const period: UserStatPeriod = '7d';
    const expected = { period } as ResponseUserStatsRetriever;
    query.execute.mockResolvedValue(expected);

    const result = await retriever.execute(period);

    expect(query.execute).toHaveBeenCalledWith(period);
    expect(result).toBe(expected);
  });

  it.each<UserStatPeriod>(['24h', '7d', '15d', '30d', '6m', 'all'])(
    'should pass period "%s" through to the query',
    async (period) => {
      query.execute.mockResolvedValue({ period } as ResponseUserStatsRetriever);

      await retriever.execute(period);

      expect(query.execute).toHaveBeenCalledWith(period);
    },
  );
});
