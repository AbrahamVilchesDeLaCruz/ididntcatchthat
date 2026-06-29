export type UserStatsByPeriod = { date: string; count: number };
export type UserStatsByProvider = { provider: string; count: number };

export type ResponseUserStatsRetriever = {
  period: string;
  // All-time snapshot — these don't change with period
  totalUsers: number;
  googleUsers: number;
  emailUsers: number;
  usersWithStreak: number;
  avgLongestStreak: number;
  neverPlayed: number;
  // Period-aware
  newRegistrations: number;
  activeUsers: number;
  engagementRate: number;
  byProvider: UserStatsByProvider[];
  byPeriod: UserStatsByPeriod[];
};
