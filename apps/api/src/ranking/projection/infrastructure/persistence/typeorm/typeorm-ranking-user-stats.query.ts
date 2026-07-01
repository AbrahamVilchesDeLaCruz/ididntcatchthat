import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type RankingUserStatsQuery } from '@/ranking/projection/domain/ranking-user-stats.query';

@Injectable()
export class TypeOrmRankingUserStatsQuery implements RankingUserStatsQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async countCompletedGames(
    userId: string,
    since: Date | null,
  ): Promise<number> {
    const sinceFilter = since ? `AND g.finished_at >= $2` : '';
    const params = since ? [userId, since] : [userId];
    const [row] = await this.dataSource.query<{ count: string }[]>(
      `SELECT COUNT(*)::text AS count
       FROM games g
       WHERE g.user_id = $1
         AND g.mode = 'game'
         AND g.status = 'completed'
         ${sinceFilter}`,
      params,
    );
    return Number(row?.count ?? 0);
  }

  async avgAccuracy(
    userId: string,
    since: Date | null,
  ): Promise<number | null> {
    const sinceFilter = since ? `AND ufs.last_seen_at >= $2` : '';
    const params = since ? [userId, since] : [userId];
    const [row] = await this.dataSource.query<{ avg: string | null }[]>(
      `SELECT AVG(ufs.accuracy_rate)::text AS avg
       FROM user_flashcard_stats ufs
       WHERE ufs.user_id = $1
         AND ufs.times_played > 0
         ${sinceFilter}`,
      params,
    );
    if (!row?.avg) return null;
    return Number(row.avg);
  }

  async sumCorrectCount(userId: string, since: Date | null): Promise<number> {
    const sinceFilter = since ? `AND ufs.last_seen_at >= $2` : '';
    const params = since ? [userId, since] : [userId];
    const [row] = await this.dataSource.query<{ sum: string }[]>(
      `SELECT COALESCE(SUM(ufs.correct_count), 0)::text AS sum
       FROM user_flashcard_stats ufs
       WHERE ufs.user_id = $1
         ${sinceFilter}`,
      params,
    );
    return Number(row?.sum ?? 0);
  }

  async moduleMasteryLevels(
    userId: string,
  ): Promise<Array<{ module: string; level: number }>> {
    const rows = await this.dataSource.query<
      { module: string; mastery_level: string }[]
    >(
      `SELECT module, mastery_level::text
       FROM module_progress
       WHERE user_id = $1`,
      [userId],
    );
    return rows.map((row) => ({
      module: row.module,
      level: Number(row.mastery_level),
    }));
  }
}
