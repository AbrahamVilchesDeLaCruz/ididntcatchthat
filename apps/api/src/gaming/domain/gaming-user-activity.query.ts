/** Read port: user activity metrics derived from games (Gaming BC owns `games` table). */
export interface GamingUserActivityQuery {
  countUsersWithAtLeastOneGame(): Promise<number>;
  countDistinctActiveUsersSince(since: Date | null): Promise<number>;
}

export const GAMING_USER_ACTIVITY_QUERY = Symbol('GamingUserActivityQuery');
