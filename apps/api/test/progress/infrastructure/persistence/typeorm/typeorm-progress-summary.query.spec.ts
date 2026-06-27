import { mock } from 'jest-mock-extended';
import { type DataSource } from 'typeorm';
import { TypeOrmProgressSummaryQuery } from '@/progress/infrastructure/persistence/typeorm/typeorm-progress-summary.query';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

describe('progress/infrastructure/persistence TypeOrmProgressSummaryQuery', () => {
  const dataSource = mock<DataSource>();
  let query: TypeOrmProgressSummaryQuery;

  beforeEach(() => {
    dataSource.query.mockReset();
    query = new TypeOrmProgressSummaryQuery(dataSource);
  });

  it('should aggregate summary metrics for a user', async () => {
    const userId = ProgressUserIdMother.random();
    dataSource.query
      .mockResolvedValueOnce([
        {
          total_attempts: '42',
          weak_count: '5',
          mastered_count: '3',
          accuracy_7d: '0.8',
          last_played_at: new Date('2026-01-01T00:00:00.000Z'),
        },
      ])
      .mockResolvedValueOnce([{ current_streak: 4, longest_streak: 10 }])
      .mockResolvedValueOnce([{ games_completed: '7' }]);

    const result = await query.findByUserId(userId);

    expect(result).toEqual({
      currentStreak: 4,
      longestStreak: 10,
      accuracy7d: 0.8,
      totalAttempts: 42,
      weakCount: 5,
      masteredCount: 3,
      gamesCompleted: 7,
      lastPlayedAt: '2026-01-01T00:00:00.000Z',
    });
  });
});
