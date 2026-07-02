import { type UserId } from '@/shared/domain/user-id';

export type RankingEligibleUserSnapshot = {
  nickname: string;
  currentStreak: number;
};

export type RankingPreferencesSnapshot = {
  nickname: string;
  showInRanking: boolean;
};

/** Read port for Ranking BC — eligibility and profile fields owned by Identity. */
export interface RankingEligibilityQuery {
  findEligibleUser(userId: UserId): Promise<RankingEligibleUserSnapshot | null>;
  findPreferences(userId: UserId): Promise<RankingPreferencesSnapshot | null>;
}

export const RANKING_ELIGIBILITY_QUERY = Symbol('RankingEligibilityQuery');
