import { mock } from 'jest-mock-extended';
import { RankingFinder } from '@/ranking/application/find/ranking-finder';
import { type RankingSelector } from '@/ranking/domain/ranking-selector';
import { RankingEntry } from '@/ranking/domain/ranking-entry';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { RankingTypeMother } from '@test/ranking/domain/ranking-type-mother';
import { RankingPeriodMother } from '@test/ranking/domain/ranking-period-mother';
import { RequestRankingFinderMother } from './request-ranking-finder-mother';

describe('ranking/application/find RankingFinder', () => {
  const selector = mock<RankingSelector>();
  let finder: RankingFinder;

  beforeEach(() => {
    selector.selectLeaderboard.mockReset();
    selector.selectUserEntry.mockReset();
    finder = new RankingFinder(selector);
  });

  it('should return entries and current user rank from top results', async () => {
    const userId = UserIdMother.random().value;
    selector.selectLeaderboard.mockResolvedValue([
      new RankingEntry(
        1,
        UserIdMother.random().value,
        NicknameMother.random().value,
        10,
      ),
      new RankingEntry(2, userId, NicknameMother.random().value, 8),
    ]);

    const result = await finder.execute(
      RequestRankingFinderMother.random({ userId }),
    );

    expect(result.entries).toHaveLength(2);
    expect(result.currentUser?.rank).toBe(2);
    expect(selector.selectUserEntry).not.toHaveBeenCalled();
  });

  it('should resolve current user outside top N from selector lookup', async () => {
    const userId = UserIdMother.random().value;
    selector.selectLeaderboard.mockResolvedValue([
      new RankingEntry(
        1,
        UserIdMother.random().value,
        NicknameMother.random().value,
        10,
      ),
    ]);
    selector.selectUserEntry.mockResolvedValue(
      new RankingEntry(15, userId, NicknameMother.random().value, 3),
    );

    const result = await finder.execute(
      RequestRankingFinderMother.random({ userId }),
    );

    expect(result.currentUser?.rank).toBe(15);
    expect(selector.selectUserEntry).toHaveBeenCalledTimes(1);
  });

  it('should use all_time period for best_streak regardless of request', async () => {
    selector.selectLeaderboard.mockResolvedValue([]);

    await finder.execute(
      RequestRankingFinderMother.random({
        type: RankingTypeMother.bestStreak().value,
        period: RankingPeriodMother.weekly().value,
      }),
    );

    const key = selector.selectLeaderboard.mock.calls[0][0];
    expect(key.period.value).toBe(RankingPeriodMother.allTime().value);
    expect(key.periodBucket).toBe('all');
  });
});
