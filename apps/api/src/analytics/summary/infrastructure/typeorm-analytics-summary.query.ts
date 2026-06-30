import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { type AnalyticsSummaryQuery } from '@/analytics/summary/application/analytics-summary.query';
import {
  type ResponseAnalyticsSummaryRetriever,
  type SummaryPeriod,
} from '@/analytics/summary/application/response-analytics-summary-retriever';

interface PeriodConfig {
  interval: string | null;
  seriesStep: string;
  dateTrunc: string;
  dateFormat: string;
}

function periodConfig(period: SummaryPeriod): PeriodConfig {
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

function whereClause(interval: string | null, column: string): string {
  return interval ? `WHERE ${column} >= NOW() - INTERVAL '${interval}'` : '';
}

function seriesStart(interval: string | null): string {
  return interval
    ? `NOW() - INTERVAL '${interval}'`
    : `'2024-01-01'::timestamp`;
}

@Injectable()
export class TypeOrmAnalyticsSummaryQuery implements AnalyticsSummaryQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    period: SummaryPeriod,
  ): Promise<ResponseAnalyticsSummaryRetriever> {
    const cfg = periodConfig(period);

    const [pageViews, games, users, flashcards] = await Promise.all([
      this.queryPageViews(period, cfg),
      this.queryGames(period, cfg),
      this.queryUsers(period, cfg),
      this.queryFlashcards(period, cfg),
    ]);

    return { period, pageViews, games, users, flashcards };
  }

  private async queryPageViews(
    _period: SummaryPeriod,
    cfg: PeriodConfig,
  ): Promise<ResponseAnalyticsSummaryRetriever['pageViews']> {
    const where = whereClause(cfg.interval, 'created_at');
    const start = seriesStart(cfg.interval);

    const [[summary], topPages, byPeriod] = await Promise.all([
      this.dataSource.query<
        {
          total: string;
          unique_visitors: string;
          registered_visitors: string;
        }[]
      >(
        `SELECT
          COUNT(*)                                                   AS total,
          COUNT(DISTINCT visitor_id)                                AS unique_visitors,
          COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN visitor_id END) AS registered_visitors
        FROM page_views ${where}`,
      ),

      this.dataSource.query<{ path: string; views: string }[]>(
        `SELECT path, COUNT(*) AS views
        FROM page_views ${where}
        GROUP BY path
        ORDER BY views DESC
        LIMIT 10`,
      ),

      this.dataSource.query<{ date: string; views: string; unique: string }[]>(
        `SELECT
          TO_CHAR(DATE_TRUNC('${cfg.dateTrunc}', gs.bucket), '${cfg.dateFormat}') AS date,
          COALESCE(SUM(d.views), 0)  AS views,
          COALESCE(SUM(d.unique), 0) AS unique
        FROM generate_series(${start}, NOW(), '${cfg.seriesStep}'::interval) AS gs(bucket)
        LEFT JOIN (
          SELECT DATE_TRUNC('${cfg.dateTrunc}', created_at) AS bucket,
                 COUNT(*)                                    AS views,
                 COUNT(DISTINCT visitor_id)                  AS unique
          FROM page_views
          ${where}
          GROUP BY bucket
        ) d ON d.bucket = gs.bucket
        GROUP BY DATE_TRUNC('${cfg.dateTrunc}', gs.bucket)
        ORDER BY DATE_TRUNC('${cfg.dateTrunc}', gs.bucket)`,
      ),
    ]);

    const total = parseInt(summary?.total ?? '0', 10);
    const uniqueVisitors = parseInt(summary?.unique_visitors ?? '0', 10);
    const registeredVisitors = parseInt(
      summary?.registered_visitors ?? '0',
      10,
    );
    const conversionRate =
      uniqueVisitors > 0
        ? parseFloat(((registeredVisitors / uniqueVisitors) * 100).toFixed(1))
        : 0;

    return {
      total,
      uniqueVisitors,
      registeredVisitors,
      conversionRate,
      topPages: topPages.map((r) => ({
        path: r.path,
        views: parseInt(r.views, 10),
      })),
      byPeriod: byPeriod.map((r) => ({
        date: r.date,
        views: parseInt(r.views, 10),
        unique: parseInt(r.unique, 10),
      })),
    };
  }

  private async queryGames(
    _period: SummaryPeriod,
    cfg: PeriodConfig,
  ): Promise<ResponseAnalyticsSummaryRetriever['games']> {
    const where = whereClause(cfg.interval, 'started_at');
    const start = seriesStart(cfg.interval);

    const [[summary], byMode, topModules, byPeriod] = await Promise.all([
      this.dataSource.query<{ total: string; completed: string }[]>(
        `SELECT
          COUNT(*)                                              AS total,
          COUNT(*) FILTER (WHERE status = 'completed')        AS completed
        FROM games ${where}`,
      ),

      this.dataSource.query<{ mode: string; count: string }[]>(
        `SELECT mode, COUNT(*) AS count
        FROM games ${where}
        GROUP BY mode
        ORDER BY count DESC`,
      ),

      this.dataSource.query<{ module: string; count: string }[]>(
        `SELECT module, COUNT(*) AS count
        FROM games
        ${where.length ? where + ' AND module IS NOT NULL' : 'WHERE module IS NOT NULL'}
        GROUP BY module
        ORDER BY count DESC
        LIMIT 10`,
      ),

      this.dataSource.query<
        { date: string; started: string; completed: string }[]
      >(
        `SELECT
          TO_CHAR(DATE_TRUNC('${cfg.dateTrunc}', gs.bucket), '${cfg.dateFormat}') AS date,
          COALESCE(SUM(d.started), 0)   AS started,
          COALESCE(SUM(d.completed), 0) AS completed
        FROM generate_series(${start}, NOW(), '${cfg.seriesStep}'::interval) AS gs(bucket)
        LEFT JOIN (
          SELECT DATE_TRUNC('${cfg.dateTrunc}', started_at) AS bucket,
                 COUNT(*)                                    AS started,
                 COUNT(*) FILTER (WHERE status = 'completed') AS completed
          FROM games
          ${where}
          GROUP BY bucket
        ) d ON d.bucket = gs.bucket
        GROUP BY DATE_TRUNC('${cfg.dateTrunc}', gs.bucket)
        ORDER BY DATE_TRUNC('${cfg.dateTrunc}', gs.bucket)`,
      ),
    ]);

    const total = parseInt(summary?.total ?? '0', 10);
    const completed = parseInt(summary?.completed ?? '0', 10);

    return {
      total,
      completed,
      completionRate:
        total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0,
      byPeriod: byPeriod.map((r) => ({
        date: r.date,
        started: parseInt(r.started, 10),
        completed: parseInt(r.completed, 10),
      })),
      byMode: byMode.map((r) => ({
        mode: r.mode,
        count: parseInt(r.count, 10),
      })),
      topModules: topModules
        .filter((r) => r.module)
        .map((r) => ({ module: r.module, count: parseInt(r.count, 10) })),
    };
  }

  private async queryUsers(
    _period: SummaryPeriod,
    cfg: PeriodConfig,
  ): Promise<ResponseAnalyticsSummaryRetriever['users']> {
    const start = seriesStart(cfg.interval);
    const activeInterval = cfg.interval ?? '30 days';

    const [[summary], byProvider, byPeriod] = await Promise.all([
      this.dataSource.query<
        { new_registrations: string; active_users: string }[]
      >(
        `SELECT
          COUNT(*) FILTER (WHERE role = 'user' ${cfg.interval ? `AND created_at >= NOW() - INTERVAL '${cfg.interval}'` : ''}) AS new_registrations,
          COUNT(*) FILTER (WHERE role = 'user' AND last_activity_date >= NOW() - INTERVAL '${activeInterval}') AS active_users
        FROM users`,
      ),

      this.dataSource.query<{ provider: string; count: string }[]>(
        `SELECT
          COALESCE(oauth_provider, 'email') AS provider,
          COUNT(*) AS count
        FROM users
        ${cfg.interval ? `WHERE created_at >= NOW() - INTERVAL '${cfg.interval}'` : ''}
        ${cfg.interval ? '' : ''}
        GROUP BY provider
        ORDER BY count DESC`,
      ),

      this.dataSource.query<{ date: string; count: string }[]>(
        `SELECT
          TO_CHAR(DATE_TRUNC('${cfg.dateTrunc}', gs.bucket), '${cfg.dateFormat}') AS date,
          COALESCE(SUM(d.count), 0) AS count
        FROM generate_series(${start}, NOW(), '${cfg.seriesStep}'::interval) AS gs(bucket)
        LEFT JOIN (
          SELECT DATE_TRUNC('${cfg.dateTrunc}', created_at) AS bucket,
                 COUNT(*) AS count
          FROM users
          WHERE role = 'user'
          ${cfg.interval ? `AND created_at >= NOW() - INTERVAL '${cfg.interval}'` : ''}
          GROUP BY bucket
        ) d ON d.bucket = gs.bucket
        GROUP BY DATE_TRUNC('${cfg.dateTrunc}', gs.bucket)
        ORDER BY DATE_TRUNC('${cfg.dateTrunc}', gs.bucket)`,
      ),
    ]);

    return {
      newRegistrations: parseInt(summary?.new_registrations ?? '0', 10),
      activeUsers: parseInt(summary?.active_users ?? '0', 10),
      byPeriod: byPeriod.map((r) => ({
        date: r.date,
        count: parseInt(r.count, 10),
      })),
      byProvider: byProvider.map((r) => ({
        provider: r.provider,
        count: parseInt(r.count, 10),
      })),
    };
  }

  private async queryFlashcards(
    _period: SummaryPeriod,
    cfg: PeriodConfig,
  ): Promise<ResponseAnalyticsSummaryRetriever['flashcards']> {
    const start = seriesStart(cfg.interval);

    const [[summary], audioStatus, byCategory, byPeriod] = await Promise.all([
      this.dataSource.query<
        {
          total: string;
          created_in_period: string;
        }[]
      >(
        `SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE ${cfg.interval ? `created_at >= NOW() - INTERVAL '${cfg.interval}'` : 'TRUE'}) AS created_in_period
        FROM flashcards`,
      ),

      this.dataSource.query<{ audio_status: string; count: string }[]>(
        `SELECT audio_status, COUNT(*) AS count FROM flashcards GROUP BY audio_status`,
      ),

      this.dataSource.query<{ category: string; count: string }[]>(
        `SELECT category, COUNT(*) AS count
        FROM flashcards
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10`,
      ),

      this.dataSource.query<{ date: string; count: string }[]>(
        `SELECT
          TO_CHAR(DATE_TRUNC('${cfg.dateTrunc}', gs.bucket), '${cfg.dateFormat}') AS date,
          COALESCE(SUM(d.count), 0) AS count
        FROM generate_series(${start}, NOW(), '${cfg.seriesStep}'::interval) AS gs(bucket)
        LEFT JOIN (
          SELECT DATE_TRUNC('${cfg.dateTrunc}', created_at) AS bucket,
                 COUNT(*) AS count
          FROM flashcards
          ${cfg.interval ? `WHERE created_at >= NOW() - INTERVAL '${cfg.interval}'` : ''}
          GROUP BY bucket
        ) d ON d.bucket = gs.bucket
        GROUP BY DATE_TRUNC('${cfg.dateTrunc}', gs.bucket)
        ORDER BY DATE_TRUNC('${cfg.dateTrunc}', gs.bucket)`,
      ),
    ]);

    const audioMap = Object.fromEntries(
      audioStatus.map((r) => [r.audio_status, parseInt(r.count, 10)]),
    );

    return {
      total: parseInt(summary?.total ?? '0', 10),
      createdInPeriod: parseInt(summary?.created_in_period ?? '0', 10),
      byPeriod: byPeriod.map((r) => ({
        date: r.date,
        count: parseInt(r.count, 10),
      })),
      audioStatus: {
        pending: audioMap['pending'] ?? 0,
        done: audioMap['done'] ?? 0,
        error: audioMap['error'] ?? 0,
      },
      byCategory: byCategory.map((r) => ({
        category: r.category,
        count: parseInt(r.count, 10),
      })),
    };
  }
}
