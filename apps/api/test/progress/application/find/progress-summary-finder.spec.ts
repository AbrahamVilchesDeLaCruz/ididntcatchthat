import { mock } from 'jest-mock-extended';
import { type ProgressSummaryQuery } from '@/progress/domain/progress-summary.query';
import { ProgressSummaryFinder } from '@/progress/application/find/progress-summary-finder';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

describe('progress/application/find ProgressSummaryFinder', () => {
  const query = mock<ProgressSummaryQuery>();
  let finder: ProgressSummaryFinder;

  beforeEach(() => {
    query.findByUserId.mockReset();
    finder = new ProgressSummaryFinder(query);
  });

  it('should delegate to ProgressSummaryQuery', async () => {
    const userId = ProgressUserIdMother.random().value;
    const summary = {
      currentStreak: 3,
      longestStreak: 5,
      accuracy7d: 0.82,
      totalAttempts: 40,
      weakCount: 2,
      masteredCount: 10,
      gamesCompleted: 4,
      lastPlayedAt: new Date().toISOString(),
    };
    query.findByUserId.mockResolvedValue(summary);

    const result = await finder.execute({ userId });

    expect(result).toEqual(summary);
    expect(query.findByUserId).toHaveBeenCalledTimes(1);
  });
});
