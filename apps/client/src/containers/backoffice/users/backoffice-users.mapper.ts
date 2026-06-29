import type { UserStatsApiModel } from './api/backoffice-users.api-model';
import type { UserStatsVM, UserStatsPeriod } from './backoffice-users.types';

export function mapUserStats(raw: UserStatsApiModel): UserStatsVM {
  return {
    period: raw.period as UserStatsPeriod,
    totalUsers: raw.totalUsers,
    googleUsers: raw.googleUsers,
    emailUsers: raw.emailUsers,
    usersWithStreak: raw.usersWithStreak,
    avgLongestStreak: raw.avgLongestStreak,
    neverPlayed: raw.neverPlayed,
    newRegistrations: raw.newRegistrations,
    activeUsers: raw.activeUsers,
    engagementRate: raw.engagementRate,
    byProvider: raw.byProvider,
    byPeriod: raw.byPeriod,
  };
}
