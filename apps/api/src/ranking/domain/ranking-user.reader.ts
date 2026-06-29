export type RankingEligibleUser = {
  nickname: string;
  currentStreak: number;
};

export type RankingUserPreferences = {
  nickname: string;
  showInRanking: boolean;
};

export interface RankingUserReader {
  findEligibleUser(userId: string): Promise<RankingEligibleUser | null>;
  findUserRankingPreferences(
    userId: string,
  ): Promise<RankingUserPreferences | null>;
}

export const RANKING_USER_READER = Symbol('RankingUserReader');
