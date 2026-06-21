import { type RankingKey } from '@/ranking/domain/ranking-key';
import { type RankingEntry } from '@/ranking/domain/ranking-entry';

export interface RankingSelector {
  selectLeaderboard(key: RankingKey, limit: number): Promise<RankingEntry[]>;
  selectUserEntry(
    key: RankingKey,
    userId: string,
  ): Promise<RankingEntry | null>;
}

export const RANKING_SELECTOR = Symbol('RankingSelector');
