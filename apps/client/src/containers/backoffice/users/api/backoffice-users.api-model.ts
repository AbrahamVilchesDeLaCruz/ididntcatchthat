export interface UserStatsByPeriodApiModel {
  date: string;
  count: number;
}

export interface UserStatsByProviderApiModel {
  provider: string;
  count: number;
}

export interface UserStatsApiModel {
  period: string;
  // All-time snapshot
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
  byProvider: UserStatsByProviderApiModel[];
  byPeriod: UserStatsByPeriodApiModel[];
}
