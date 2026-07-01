import { mock } from 'jest-mock-extended';
import { type DataSource } from 'typeorm';
import { type UserStreakQuery } from '@/identity/user/domain/user-streak.query';
import { type UserGamesCompletedQuery } from '@/gaming/domain/user-games-completed.query';
import { TypeOrmProgressSummaryQuery } from '@/progress/infrastructure/persistence/typeorm/typeorm-progress-summary.query';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

describe('progress/infrastructure/persistence TypeOrmProgressSummaryQuery', () => {
  const dataSource = mock<DataSource>();
  const userStreakQuery = mock<UserStreakQuery>();
  const userGamesCompletedQuery = mock<UserGamesCompletedQuery>();
  let query: TypeOrmProgressSummaryQuery;

  beforeEach(() => {
    dataSource.query.mockReset();
    userStreakQuery.findByUserId.mockReset();
    userGamesCompletedQuery.countCompletedGameMode.mockReset();
    query = new TypeOrmProgressSummaryQuery(
      dataSource,
      userStreakQuery,
      userGamesCompletedQuery,
    );
  });

  it('should aggregate summary metrics for a user', async () => {
    const userId = ProgressUserIdMother.random();
    dataSource.query.mockResolvedValueOnce([
      {
        total_attempts: '42',
        weak_count: '5',
        mastered_count: '3',
        accuracy_7d: '0.8',
        last_played_at: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);
    userStreakQuery.findByUserId.mockResolvedValue({
      currentStreak: 4,
      longestStreak: 10,
    });
    userGamesCompletedQuery.countCompletedGameMode.mockResolvedValue(7);

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
    expect(userStreakQuery.findByUserId).toHaveBeenCalledWith(userId);
    expect(userGamesCompletedQuery.countCompletedGameMode).toHaveBeenCalledWith(
      userId,
    );
  });
});
