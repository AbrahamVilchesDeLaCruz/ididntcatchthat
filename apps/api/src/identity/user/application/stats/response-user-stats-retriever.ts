export interface ResponseUserStatsRetriever {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  googleUsers: number;
  emailUsers: number;
  usersWithStreak: number;
  avgLongestStreak: number;
  engagementRate: number;
}
