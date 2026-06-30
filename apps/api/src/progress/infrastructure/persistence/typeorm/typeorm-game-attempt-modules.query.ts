import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LEARNING_MODULES } from '@/shared/domain/learning-module';
import { type GameAttemptModulesQuery } from '@/progress/domain/game-attempt-modules.query';

interface GameAttemptModuleRow {
  category: string;
}

@Injectable()
export class TypeOrmGameAttemptModulesQuery implements GameAttemptModulesQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findModulesByGameId(gameId: string): Promise<string[]> {
    const rows = await this.dataSource.query<GameAttemptModuleRow[]>(
      `SELECT DISTINCT f.category
       FROM (
         SELECT a.flashcard_id
         FROM attempts a
         WHERE a.game_id = $1
         UNION
         SELECT v.flashcard_id
         FROM game_views v
         WHERE v.game_id = $1
       ) activity
       INNER JOIN flashcards f ON f.id = activity.flashcard_id
       ORDER BY f.category ASC`,
      [gameId],
    );

    const validModules = new Set<string>(LEARNING_MODULES);
    return rows
      .map((row) => row.category)
      .filter((category) => validModules.has(category));
  }
}
