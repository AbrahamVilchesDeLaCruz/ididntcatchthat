import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface GameStatsByModule {
  module: string | null;
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
}

export interface GamesStatsSummary {
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
  totalAttempts: number;
  byModule: GameStatsByModule[];
}

@Injectable()
export class GamesStatsQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(): Promise<GamesStatsSummary> {
    const [totals] = await this.dataSource.query<
      { total: string; completed: string; avg_accuracy: string }[]
    >(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COALESCE(
          ROUND(
            AVG(
              CASE WHEN status = 'completed' THEN
                (SELECT ROUND(AVG(CASE WHEN a.correct THEN 1.0 ELSE 0.0 END) * 100, 2)
                   FROM attempts a WHERE a.game_id = g.id)
              END
            ), 2
          ), 0
        ) AS avg_accuracy
      FROM games g
    `);

    const [{ total_attempts }] = await this.dataSource.query<
      { total_attempts: string }[]
    >('SELECT COUNT(*) AS total_attempts FROM attempts');

    const byModule = await this.dataSource.query<
      {
        module: string | null;
        total: string;
        completed: string;
        avg_accuracy: string;
      }[]
    >(`
      SELECT
        g.module,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE g.status = 'completed') AS completed,
        COALESCE(
          ROUND(
            AVG(
              CASE WHEN g.status = 'completed' THEN
                (SELECT ROUND(AVG(CASE WHEN a.correct THEN 1.0 ELSE 0.0 END) * 100, 2)
                   FROM attempts a WHERE a.game_id = g.id)
              END
            ), 2
          ), 0
        ) AS avg_accuracy
      FROM games g
      GROUP BY g.module
      ORDER BY total DESC
    `);

    return {
      totalGames: parseInt(totals.total, 10),
      completedGames: parseInt(totals.completed, 10),
      avgAccuracy: parseFloat(totals.avg_accuracy),
      totalAttempts: parseInt(total_attempts, 10),
      byModule: byModule.map((row) => ({
        module: row.module,
        totalGames: parseInt(row.total, 10),
        completedGames: parseInt(row.completed, 10),
        avgAccuracy: parseFloat(row.avg_accuracy),
      })),
    };
  }
}
