import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  type ProgressSummary,
  type ProgressSummaryQuery,
} from '@/progress/domain/progress-summary.query';
import {
  type UserStreakQuery,
  USER_STREAK_QUERY,
} from '@/identity/user/domain/user-streak.query';
import {
  type UserGamesCompletedQuery,
  USER_GAMES_COMPLETED_QUERY,
} from '@/gaming/domain/user-games-completed.query';
import { type UserId } from '@/shared/domain/user-id';

interface StatsRow {
  total_attempts: string;
  weak_count: string;
  mastered_count: string;
  accuracy_7d: string | null;
  last_played_at: Date | null;
}

@Injectable()
export class TypeOrmProgressSummaryQuery implements ProgressSummaryQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(USER_STREAK_QUERY)
    private readonly userStreakQuery: UserStreakQuery,
    @Inject(USER_GAMES_COMPLETED_QUERY)
    private readonly userGamesCompletedQuery: UserGamesCompletedQuery,
  ) {}

  async findByUserId(userId: UserId): Promise<ProgressSummary> {
    const [statsRows, streak, gamesCompleted] = await Promise.all([
      this.dataSource.query<StatsRow[]>(
        `SELECT
           COALESCE(SUM(ufs.times_played + ufs.times_studied), 0)::int AS total_attempts,
           COUNT(*) FILTER (
             WHERE ufs.times_played > 0
               AND (ufs.times_played - 2*ufs.correct_count) > 0
           )::int AS weak_count,
           COUNT(*) FILTER (
             WHERE ufs.times_played >= 5 AND ufs.accuracy_rate >= 0.85
           )::int AS mastered_count,
           COALESCE(
             SUM(
               CASE
                 WHEN ufs.last_seen_at >= NOW() - INTERVAL '7 days'
                 THEN ufs.correct_count
                 ELSE 0
               END
             )::float
             / NULLIF(
               SUM(
                 CASE
                   WHEN ufs.last_seen_at >= NOW() - INTERVAL '7 days'
                   THEN ufs.times_played
                   ELSE 0
                 END
               ),
               0
             ),
             0
           ) AS accuracy_7d,
           MAX(ufs.last_seen_at) AS last_played_at
         FROM user_flashcard_stats ufs
         WHERE ufs.user_id = $1`,
        [userId.value],
      ),
      this.userStreakQuery.findByUserId(userId),
      this.userGamesCompletedQuery.countCompletedGameMode(userId),
    ]);

    const stats = statsRows[0];

    return {
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      accuracy7d: Number(stats?.accuracy_7d ?? 0),
      totalAttempts: Number(stats?.total_attempts ?? 0),
      weakCount: Number(stats?.weak_count ?? 0),
      masteredCount: Number(stats?.mastered_count ?? 0),
      gamesCompleted,
      lastPlayedAt: stats?.last_played_at
        ? stats.last_played_at.toISOString()
        : null,
    };
  }
}
