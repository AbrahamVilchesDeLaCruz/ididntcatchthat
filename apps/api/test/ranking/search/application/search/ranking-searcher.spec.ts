import { mock } from 'jest-mock-extended';
import { RankingSearcher } from '@/ranking/search/application/search/ranking-searcher';
import { type RankingLeaderboardQuery } from '@/ranking/search/domain/ranking-leaderboard.query';
import { type RankingProfileQuery } from '@/ranking/shared/domain/ranking-profile.query';
import { RankingViewerProjector } from '@/ranking/search/domain/ranking-viewer-projector';
import { RankingEntry } from '@/ranking/search/domain/ranking-entry';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { RankingTypeMother } from '@test/ranking/shared/domain/ranking-type-mother';
import { RankingPeriodMother } from '@test/ranking/shared/domain/ranking-period-mother';
import { RequestRankingSearcherMother } from './request-ranking-searcher-mother';

describe('ranking/application/search RankingSearcher', () => {
  const leaderboardQuery = mock<RankingLeaderboardQuery>();
  const profileQuery = mock<RankingProfileQuery>();
  const viewerProjector = new RankingViewerProjector();
  let searcher: RankingSearcher;

  beforeEach(() => {
    leaderboardQuery.selectLeaderboard.mockReset();
    leaderboardQuery.selectUserEntry.mockReset();
    profileQuery.findUserRankingPreferences.mockReset();
    profileQuery.findUserRankingPreferences.mockResolvedValue({
      nickname: NicknameMother.random().value,
      showInRanking: true,
    });
    searcher = new RankingSearcher(
      leaderboardQuery,
      profileQuery,
      viewerProjector,
    );
  });

  it('should return entries with isMe and current user rank from top results', async () => {
    const userId = UserIdMother.random().value;
    leaderboardQuery.selectLeaderboard.mockResolvedValue([
      new RankingEntry(
        1,
        UserIdMother.random().value,
        NicknameMother.random().value,
        10,
      ),
      new RankingEntry(2, userId, NicknameMother.random().value, 8),
    ]);

    const result = await searcher.execute(
      RequestRankingSearcherMother.random({ userId }),
    );

    expect(result.entries).toHaveLength(2);
    expect(result.entries[1].isMe).toBe(true);
    expect(result.entries[0].isMe).toBe(false);
    expect(result.currentUser?.rank).toBe(2);
    expect(result.viewer.status).toBe('ranked');
    expect(result.viewer.rank).toBe(2);
    expect(leaderboardQuery.selectUserEntry).not.toHaveBeenCalled();
  });

  it('should resolve current user outside top N from leaderboard lookup', async () => {
    const userId = UserIdMother.random().value;
    leaderboardQuery.selectLeaderboard.mockResolvedValue([
      new RankingEntry(
        1,
        UserIdMother.random().value,
        NicknameMother.random().value,
        10,
      ),
    ]);
    leaderboardQuery.selectUserEntry.mockResolvedValue(
      new RankingEntry(15, userId, NicknameMother.random().value, 3),
    );

    const result = await searcher.execute(
      RequestRankingSearcherMother.random({ userId }),
    );

    expect(result.currentUser?.rank).toBe(15);
    expect(result.viewer.status).toBe('ranked');
    expect(result.viewer.rank).toBe(15);
    expect(leaderboardQuery.selectUserEntry).toHaveBeenCalledTimes(1);
  });

  it('should return viewer hidden when user opted out', async () => {
    const userId = UserIdMother.random().value;
    leaderboardQuery.selectLeaderboard.mockResolvedValue([]);
    profileQuery.findUserRankingPreferences.mockResolvedValue({
      nickname: 'hidden-user',
      showInRanking: false,
    });

    const result = await searcher.execute(
      RequestRankingSearcherMother.random({ userId }),
    );

    expect(result.viewer).toEqual({
      showInRanking: false,
      nickname: 'hidden-user',
      rank: null,
      score: null,
      status: 'hidden',
    });
    expect(result.currentUser).toBeNull();
  });

  it('should return viewer visible_unranked when opted in without score', async () => {
    const userId = UserIdMother.random().value;
    leaderboardQuery.selectLeaderboard.mockResolvedValue([]);
    leaderboardQuery.selectUserEntry.mockResolvedValue(null);
    profileQuery.findUserRankingPreferences.mockResolvedValue({
      nickname: 'new-player',
      showInRanking: true,
    });

    const result = await searcher.execute(
      RequestRankingSearcherMother.random({ userId }),
    );

    expect(result.viewer.status).toBe('visible_unranked');
    expect(result.viewer.rank).toBeNull();
    expect(result.currentUser).toBeNull();
  });

  it('should use all_time period for best_streak regardless of request', async () => {
    leaderboardQuery.selectLeaderboard.mockResolvedValue([]);

    await searcher.execute(
      RequestRankingSearcherMother.random({
        type: RankingTypeMother.bestStreak().value,
        period: RankingPeriodMother.weekly().value,
      }),
    );

    const key = leaderboardQuery.selectLeaderboard.mock.calls[0][0];
    expect(key.period.value).toBe(RankingPeriodMother.allTime().value);
    expect(key.periodBucket).toBe('all');
  });
});
