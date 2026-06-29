import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type UserStatsQuery } from '@/identity/user/application/stats/user-stats.query';
import { type ResponseUserStatsRetriever } from '@/identity/user/application/stats/response-user-stats-retriever';

@Injectable()
export class TypeOrmUserStatsQuery implements UserStatsQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(): Promise<ResponseUserStatsRetriever> {
    const [row] = await this.dataSource.query<
      {
        total_users: string;
        new_7: string;
        new_30: string;
        active_7: string;
        active_30: string;
        google_users: string;
        email_users: string;
        with_streak: string;
        avg_longest: string;
      }[]
    >(`
      SELECT
        COUNT(*)
          FILTER (WHERE role = 'user')                                          AS total_users,
        COUNT(*)
          FILTER (WHERE role = 'user'
                    AND created_at >= NOW() - INTERVAL '7 days')               AS new_7,
        COUNT(*)
          FILTER (WHERE role = 'user'
                    AND created_at >= NOW() - INTERVAL '30 days')              AS new_30,
        COUNT(*)
          FILTER (WHERE role = 'user'
                    AND last_activity_date >= NOW() - INTERVAL '7 days')       AS active_7,
        COUNT(*)
          FILTER (WHERE role = 'user'
                    AND last_activity_date >= NOW() - INTERVAL '30 days')      AS active_30,
        COUNT(*)
          FILTER (WHERE role = 'user'
                    AND oauth_provider = 'google')                             AS google_users,
        COUNT(*)
          FILTER (WHERE role = 'user'
                    AND oauth_provider IS NULL)                                AS email_users,
        COUNT(*)
          FILTER (WHERE role = 'user'
                    AND current_streak > 0)                                    AS with_streak,
        COALESCE(
          ROUND(AVG(longest_streak) FILTER (WHERE role = 'user'), 1),
          0
        )                                                                       AS avg_longest
      FROM users
    `);

    const totalUsers = parseInt(row.total_users, 10);
    const activeUsersLast30Days = parseInt(row.active_30, 10);
    const engagementRate =
      totalUsers > 0
        ? parseFloat(((activeUsersLast30Days / totalUsers) * 100).toFixed(1))
        : 0;

    return {
      totalUsers,
      newUsersLast7Days: parseInt(row.new_7, 10),
      newUsersLast30Days: parseInt(row.new_30, 10),
      activeUsersLast7Days: parseInt(row.active_7, 10),
      activeUsersLast30Days,
      googleUsers: parseInt(row.google_users, 10),
      emailUsers: parseInt(row.email_users, 10),
      usersWithStreak: parseInt(row.with_streak, 10),
      avgLongestStreak: parseFloat(row.avg_longest),
      engagementRate,
    };
  }
}
