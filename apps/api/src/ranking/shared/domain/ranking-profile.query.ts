export type RankingEligibleUser = {
  nickname: string;
  currentStreak: number;
};

export type RankingUserPreferences = {
  nickname: string;
  showInRanking: boolean;
};

export interface RankingProfileQuery {
  findEligibleUser(userId: string): Promise<RankingEligibleUser | null>;
  findUserRankingPreferences(
    userId: string,
  ): Promise<RankingUserPreferences | null>;
}

export const RANKING_PROFILE_QUERY = Symbol('RankingProfileQuery');
