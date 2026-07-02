import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type GameModuleQuery } from '@/progress/domain/game-module.query';

interface GameModuleRow {
  module: string | null;
}

@Injectable()
export class TypeOrmGameModuleQuery implements GameModuleQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getModule(gameId: string): Promise<string | null> {
    const rows = await this.dataSource.query<GameModuleRow[]>(
      `SELECT module FROM games WHERE id = $1 LIMIT 1`,
      [gameId],
    );

    return rows[0]?.module ?? null;
  }
}
