export interface RankingUserStatsQuery {
  countCompletedGames(userId: string, since: Date | null): Promise<number>;
  avgAccuracy(userId: string, since: Date | null): Promise<number | null>;
  sumCorrectCount(userId: string, since: Date | null): Promise<number>;
  moduleMasteryLevels(
    userId: string,
  ): Promise<Array<{ module: string; level: number }>>;
}

export const RANKING_USER_STATS_QUERY = Symbol('RankingUserStatsQuery');
