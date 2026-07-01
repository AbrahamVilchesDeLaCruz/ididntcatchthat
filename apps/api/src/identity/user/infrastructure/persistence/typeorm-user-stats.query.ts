import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  GAMING_USER_ACTIVITY_QUERY,
  type GamingUserActivityQuery,
} from '@/gaming/domain/gaming-user-activity.query';
import {
  type UserStatsQuery,
  type UserStatPeriod,
} from '@/identity/user/application/stats/user-stats.query';
import { type ResponseUserStatsRetriever } from '@/identity/user/application/stats/response-user-stats-retriever';

interface PeriodCfg {
  interval: string | null;
  seriesStep: string;
  dateTrunc: string;
  dateFormat: string;
}

function periodCfg(period: UserStatPeriod): PeriodCfg {
  switch (period) {
    case '24h':
      return {
        interval: '24 hours',
        seriesStep: '1 hour',
        dateTrunc: 'hour',
        dateFormat: 'HH24:MI',
      };
    case '7d':
      return {
        interval: '7 days',
        seriesStep: '1 day',
        dateTrunc: 'day',
        dateFormat: 'DD/MM',
      };
    case '15d':
      return {
        interval: '15 days',
        seriesStep: '1 day',
        dateTrunc: 'day',
        dateFormat: 'DD/MM',
      };
    case '30d':
      return {
        interval: '30 days',
        seriesStep: '1 day',
        dateTrunc: 'day',
        dateFormat: 'DD/MM',
      };
    case '6m':
      return {
        interval: '6 months',
        seriesStep: '1 week',
        dateTrunc: 'week',
        dateFormat: 'DD/MM',
      };
    case 'all':
      return {
        interval: null,
        seriesStep: '1 month',
        dateTrunc: 'month',
        dateFormat: 'MM/YYYY',
      };
  }
}

function sinceDateForInterval(interval: string | null): Date | null {
  if (!interval) return null;
  const since = new Date();
  const match = /^(\d+)\s+(hour|hours|day|days|month|months)$/.exec(interval);
  if (!match) return since;

  const amount = parseInt(match[1], 10);
  const unit = match[2];
  if (unit.startsWith('hour')) {
    since.setHours(since.getHours() - amount);
  } else if (unit.startsWith('day')) {
    since.setDate(since.getDate() - amount);
  } else {
    since.setMonth(since.getMonth() - amount);
  }
  return since;
}

@Injectable()
export class TypeOrmUserStatsQuery implements UserStatsQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(GAMING_USER_ACTIVITY_QUERY)
    private readonly gamingActivity: GamingUserActivityQuery,
  ) {}

  async execute(period: UserStatPeriod): Promise<ResponseUserStatsRetriever> {
    const pc = periodCfg(period);
    const startExpr = pc.interval
      ? `NOW() - INTERVAL '${pc.interval}'`
      : `'2024-01-01'::timestamp`;
    const whereClause = pc.interval
      ? `WHERE created_at >= NOW() - INTERVAL '${pc.interval}'`
      : '';

    const usersWithGames =
      await this.gamingActivity.countUsersWithAtLeastOneGame();
    const activeUsers = await this.gamingActivity.countDistinctActiveUsersSince(
      sinceDateForInterval(pc.interval),
    );

    const [snapshot, periodStats, byProvider, byPeriod] = await Promise.all([
      this.dataSource.query<
        {
          total: string;
          google_users: string;
          email_users: string;
          users_with_streak: string;
          avg_longest_streak: string;
        }[]
      >(`
        SELECT
          COUNT(*)                                                        AS total,
          COUNT(*) FILTER (WHERE oauth_provider = 'google')              AS google_users,
          COUNT(*) FILTER (WHERE oauth_provider IS NULL)                  AS email_users,
          COUNT(*) FILTER (WHERE longest_streak > 0)                     AS users_with_streak,
          COALESCE(ROUND(AVG(longest_streak)::numeric, 1), 0)            AS avg_longest_streak
        FROM users
      `),

      this.dataSource.query<{ new_registrations: string }[]>(`
        SELECT COUNT(*) AS new_registrations
        FROM users
        ${whereClause}
      `),

      this.dataSource.query<{ provider: string; count: string }[]>(`
        SELECT
          COALESCE(oauth_provider, 'email') AS provider,
          COUNT(*) AS count
        FROM users
        ${whereClause}
        GROUP BY oauth_provider
        ORDER BY count DESC
      `),

      this.dataSource.query<{ date: string; count: string }[]>(`
        SELECT
          TO_CHAR(DATE_TRUNC('${pc.dateTrunc}', gs.bucket), '${pc.dateFormat}') AS date,
          COALESCE(SUM(d.cnt), 0) AS count
        FROM generate_series(${startExpr}, NOW(), '${pc.seriesStep}'::interval) AS gs(bucket)
        LEFT JOIN (
          SELECT DATE_TRUNC('${pc.dateTrunc}', created_at) AS bucket, COUNT(*) AS cnt
          FROM users
          ${whereClause}
          GROUP BY bucket
        ) d ON d.bucket = gs.bucket
        GROUP BY DATE_TRUNC('${pc.dateTrunc}', gs.bucket)
        ORDER BY DATE_TRUNC('${pc.dateTrunc}', gs.bucket)
      `),
    ]);

    const snap = snapshot[0];
    const ps = periodStats[0];
    const totalUsers = parseInt(snap.total, 10);
    const neverPlayed = Math.max(0, totalUsers - usersWithGames);
    const engagementRate =
      totalUsers > 0
        ? parseFloat(((activeUsers / totalUsers) * 100).toFixed(1))
        : 0;

    return {
      period,
      totalUsers,
      googleUsers: parseInt(snap.google_users, 10),
      emailUsers: parseInt(snap.email_users, 10),
      usersWithStreak: parseInt(snap.users_with_streak, 10),
      avgLongestStreak: parseFloat(snap.avg_longest_streak),
      neverPlayed,
      newRegistrations: parseInt(ps.new_registrations, 10),
      activeUsers,
      engagementRate,
      byProvider: byProvider.map((r) => ({
        provider: r.provider,
        count: parseInt(r.count, 10),
      })),
      byPeriod: byPeriod.map((r) => ({
        date: r.date,
        count: parseInt(r.count, 10),
      })),
    };
  }
}
