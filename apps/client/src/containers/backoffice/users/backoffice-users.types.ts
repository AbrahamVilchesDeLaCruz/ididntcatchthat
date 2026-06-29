export type UserStatsPeriod = '24h' | '7d' | '15d' | '30d' | '6m' | 'all';

export interface UserStatsByPeriodVM {
  date: string;
  count: number;
}

export interface UserStatsByProviderVM {
  provider: string;
  count: number;
}

export interface UserStatsVM {
  period: UserStatsPeriod;
  // All-time snapshot
  totalUsers: number;
  googleUsers: number;
  emailUsers: number;
  usersWithStreak: number;
  avgLongestStreak: number;
  // Period-aware
  newRegistrations: number;
  activeUsers: number;
  engagementRate: number;
  byProvider: UserStatsByProviderVM[];
  byPeriod: UserStatsByPeriodVM[];
}
