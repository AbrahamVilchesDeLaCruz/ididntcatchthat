import { mock } from 'jest-mock-extended';
import { TypeOrmGamingUserActivityQuery } from '@/gaming/infrastructure/persistence/typeorm-gaming-user-activity.query';
import { type DataSource } from 'typeorm';

describe('gaming/infrastructure/persistence TypeOrmGamingUserActivityQuery', () => {
  const dataSource = mock<DataSource>();
  let query: TypeOrmGamingUserActivityQuery;

  beforeEach(() => {
    dataSource.query.mockReset();
    query = new TypeOrmGamingUserActivityQuery(dataSource);
  });

  it('should count users with at least one game', async () => {
    dataSource.query.mockResolvedValueOnce([{ count: '7' }]);

    const count = await query.countUsersWithAtLeastOneGame();

    expect(count).toBe(7);
  });

  it('should count distinct active users since a date', async () => {
    const since = new Date('2026-06-01T00:00:00.000Z');
    dataSource.query.mockResolvedValueOnce([{ count: '3' }]);

    const count = await query.countDistinctActiveUsersSince(since);

    expect(count).toBe(3);
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('started_at >='),
      [since],
    );
  });
});
