import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type GameStatsQuery } from '@/gaming/application/stats/game-stats.query';
import {
  type ResponseGameStatsRetriever,
  type StatPeriod,
} from '@/gaming/application/stats/response-game-stats-retriever';

interface PeriodCfg {
  interval: string | null;
  seriesStep: string;
  dateTrunc: string;
  dateFormat: string;
}

function cfg(period: StatPeriod): PeriodCfg {
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

function where(interval: string | null): string {
  return interval ? `WHERE g.started_at >= NOW() - INTERVAL '${interval}'` : '';
}

function seriesStart(interval: string | null): string {
  return interval
    ? `NOW() - INTERVAL '${interval}'`
    : `'2024-01-01'::timestamp`;
}

@Injectable()
export class TypeOrmGameStatsQuery implements GameStatsQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(period: StatPeriod): Promise<ResponseGameStatsRetriever> {
    const pc = cfg(period);
    const periodWhere = where(pc.interval);
    const start = seriesStart(pc.interval);

    const [totals, byModule, byMode, byPeriod] = await Promise.all([
      this.dataSource.query<
        {
          total: string;
          completed: string;
          avg_accuracy: string;
          total_attempts: string;
        }[]
      >(`
        SELECT
          COUNT(g.id)                                           AS total,
          COUNT(g.id) FILTER (WHERE g.status = 'completed')    AS completed,
          COALESCE(
            ROUND(
              AVG(
                CASE WHEN g.status = 'completed' THEN
                  (SELECT ROUND(AVG(CASE WHEN a.correct THEN 1.0 ELSE 0.0 END) * 100, 2)
                   FROM attempts a WHERE a.game_id = g.id)
                END
              ), 2
            ), 0
          )                                                     AS avg_accuracy,
          (SELECT COUNT(*) FROM attempts a2
           JOIN games g2 ON a2.game_id = g2.id
           ${pc.interval ? `WHERE g2.started_at >= NOW() - INTERVAL '${pc.interval}'` : ''}
          )                                                     AS total_attempts
        FROM games g
        ${periodWhere}
      `),

      this.dataSource.query<
        {
          module: string | null;
          total: string;
          completed: string;
          avg_accuracy: string;
        }[]
      >(`
        SELECT
          g.module,
          COUNT(g.id)                                           AS total,
          COUNT(g.id) FILTER (WHERE g.status = 'completed')    AS completed,
          COALESCE(
            ROUND(
              AVG(
                CASE WHEN g.status = 'completed' THEN
                  (SELECT ROUND(AVG(CASE WHEN a.correct THEN 1.0 ELSE 0.0 END) * 100, 2)
                   FROM attempts a WHERE a.game_id = g.id)
                END
              ), 2
            ), 0
          )                                                     AS avg_accuracy
        FROM games g
        ${periodWhere}
        GROUP BY g.module
        ORDER BY total DESC
      `),

      this.dataSource.query<{ mode: string; count: string }[]>(`
        SELECT mode, COUNT(*) AS count
        FROM games g
        ${periodWhere}
        GROUP BY mode
        ORDER BY count DESC
      `),

      this.dataSource.query<
        { date: string; started: string; completed: string }[]
      >(`
        SELECT
          TO_CHAR(DATE_TRUNC('${pc.dateTrunc}', gs.bucket), '${pc.dateFormat}') AS date,
          COALESCE(SUM(d.started), 0)   AS started,
          COALESCE(SUM(d.completed), 0) AS completed
        FROM generate_series(${start}, NOW(), '${pc.seriesStep}'::interval) AS gs(bucket)
        LEFT JOIN (
          SELECT
            DATE_TRUNC('${pc.dateTrunc}', started_at)              AS bucket,
            COUNT(*)                                                AS started,
            COUNT(*) FILTER (WHERE status = 'completed')           AS completed
          FROM games
          ${pc.interval ? `WHERE started_at >= NOW() - INTERVAL '${pc.interval}'` : ''}
          GROUP BY bucket
        ) d ON d.bucket = gs.bucket
        GROUP BY DATE_TRUNC('${pc.dateTrunc}', gs.bucket)
        ORDER BY DATE_TRUNC('${pc.dateTrunc}', gs.bucket)
      `),
    ]);

    const t = totals[0];
    const total = parseInt(t.total, 10);
    const completed = parseInt(t.completed, 10);

    return {
      period,
      totalGames: total,
      completedGames: completed,
      completionRate:
        total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0,
      avgAccuracy: parseFloat(t.avg_accuracy),
      totalAttempts: parseInt(t.total_attempts, 10),
      byModule: byModule.map((r) => ({
        module: r.module,
        totalGames: parseInt(r.total, 10),
        completedGames: parseInt(r.completed, 10),
        avgAccuracy: parseFloat(r.avg_accuracy),
      })),
      byMode: byMode.map((r) => ({
        mode: r.mode,
        count: parseInt(r.count, 10),
      })),
      byPeriod: byPeriod.map((r) => ({
        date: r.date,
        started: parseInt(r.started, 10),
        completed: parseInt(r.completed, 10),
      })),
    };
  }
}
