// ─── ViewModel types ──────────────────────────────────────────────────────────

export interface MetricSampleVM {
  labels: Record<string, string>;
  value: number;
}

export interface MetricVM {
  name: string;
  help: string;
  type: string;
  samples: MetricSampleVM[];
}

export interface MetricsSummaryVM {
  metrics: MetricVM[];
}

export interface UserStatsVM {
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
