export type RankingEligibleUser = {
  nickname: string;
  currentStreak: number;
};

export interface RankingUserReader {
  findEligibleUser(userId: string): Promise<RankingEligibleUser | null>;
}

export const RANKING_USER_READER = Symbol('RankingUserReader');
