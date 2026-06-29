// ─── Raw API models ───────────────────────────────────────────────────────────

export interface MetricSampleApiModel {
  labels: Record<string, string>;
  value: number;
}

export interface MetricApiModel {
  name: string;
  help: string;
  type: string;
  samples: MetricSampleApiModel[];
}

export interface MetricsSummaryApiModel {
  metrics: MetricApiModel[];
}

export interface UserStatsApiModel {
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
