import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type GamingUserActivityQuery } from '@/gaming/domain/gaming-user-activity.query';

@Injectable()
export class TypeOrmGamingUserActivityQuery implements GamingUserActivityQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async countUsersWithAtLeastOneGame(): Promise<number> {
    const rows = await this.dataSource.query<{ count: string }[]>(`
      SELECT COUNT(DISTINCT user_id)::int AS count
      FROM games
      WHERE user_id IS NOT NULL
    `);
    return Number(rows[0]?.count ?? 0);
  }

  async countDistinctActiveUsersSince(since: Date | null): Promise<number> {
    if (since === null) {
      const rows = await this.dataSource.query<{ count: string }[]>(`
        SELECT COUNT(DISTINCT user_id)::int AS count
        FROM games
        WHERE user_id IS NOT NULL
      `);
      return Number(rows[0]?.count ?? 0);
    }

    const rows = await this.dataSource.query<{ count: string }[]>(
      `
        SELECT COUNT(DISTINCT user_id)::int AS count
        FROM games
        WHERE user_id IS NOT NULL
          AND started_at >= $1
      `,
      [since],
    );
    return Number(rows[0]?.count ?? 0);
  }
}
