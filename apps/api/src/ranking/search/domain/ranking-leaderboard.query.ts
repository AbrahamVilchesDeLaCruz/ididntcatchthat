import { type RankingKey } from '@/ranking/shared/domain/ranking-key';
import { type RankingEntry } from '@/ranking/search/domain/ranking-entry';

export interface RankingLeaderboardQuery {
  selectLeaderboard(key: RankingKey, limit: number): Promise<RankingEntry[]>;
  selectUserEntry(
    key: RankingKey,
    userId: string,
  ): Promise<RankingEntry | null>;
}

export const RANKING_LEADERBOARD_QUERY = Symbol('RankingLeaderboardQuery');
