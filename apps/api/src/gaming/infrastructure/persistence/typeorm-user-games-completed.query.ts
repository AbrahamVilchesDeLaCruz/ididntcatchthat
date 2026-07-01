import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type UserGamesCompletedQuery } from '@/gaming/domain/user-games-completed.query';
import { type UserId } from '@/shared/domain/user-id';

interface GamesRow {
  games_completed: string;
}

@Injectable()
export class TypeOrmUserGamesCompletedQuery implements UserGamesCompletedQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async countCompletedGameMode(userId: UserId): Promise<number> {
    const rows = await this.dataSource.query<GamesRow[]>(
      `SELECT COUNT(*)::int AS games_completed
       FROM games
       WHERE user_id = $1 AND status = 'completed' AND mode = 'game'`,
      [userId.value],
    );

    return Number(rows[0]?.games_completed ?? 0);
  }
}
