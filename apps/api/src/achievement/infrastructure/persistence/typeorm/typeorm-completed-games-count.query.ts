import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type CompletedGamesCountQuery } from '@/achievement/domain/completed-games-count.query';
import { type UserId } from '@/shared/domain/user-id';

@Injectable()
export class TypeOrmCompletedGamesCountQuery implements CompletedGamesCountQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async countCompletedGames(userId: UserId): Promise<number> {
    const rows = await this.dataSource.query<{ count: string }[]>(
      `SELECT COUNT(*)::int AS count
       FROM games
       WHERE user_id = $1
         AND status = 'completed'
         AND mode = 'game'`,
      [userId.value],
    );
    return Number(rows[0]?.count ?? 0);
  }

  async countCompletedStudySessions(userId: UserId): Promise<number> {
    const rows = await this.dataSource.query<{ count: string }[]>(
      `SELECT COUNT(*)::int AS count
       FROM games
       WHERE user_id = $1
         AND status = 'completed'
         AND mode = 'study'`,
      [userId.value],
    );
    return Number(rows[0]?.count ?? 0);
  }
}
