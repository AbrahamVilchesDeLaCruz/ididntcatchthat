import type {
  MetricsSummaryApiModel,
  MetricApiModel,
  MetricSampleApiModel,
  UserStatsApiModel,
} from './api/observability.api-model';
import type {
  MetricsSummaryVM,
  MetricVM,
  MetricSampleVM,
  UserStatsVM,
} from './observability.types';

function mapMetricSample(raw: MetricSampleApiModel): MetricSampleVM {
  return {
    labels: raw.labels,
    value: raw.value,
  };
}

function mapMetric(raw: MetricApiModel): MetricVM {
  return {
    name: raw.name,
    help: raw.help,
    type: raw.type,
    samples: raw.samples.map(mapMetricSample),
  };
}

export function mapMetricsSummary(
  raw: MetricsSummaryApiModel,
): MetricsSummaryVM {
  return {
    metrics: raw.metrics.map(mapMetric),
  };
}

export function mapUserStats(raw: UserStatsApiModel): UserStatsVM {
  return {
    totalUsers: raw.totalUsers,
    newUsersLast7Days: raw.newUsersLast7Days,
    newUsersLast30Days: raw.newUsersLast30Days,
    activeUsersLast7Days: raw.activeUsersLast7Days,
    activeUsersLast30Days: raw.activeUsersLast30Days,
    googleUsers: raw.googleUsers,
    emailUsers: raw.emailUsers,
    usersWithStreak: raw.usersWithStreak,
    avgLongestStreak: raw.avgLongestStreak,
    engagementRate: raw.engagementRate,
  };
}
