import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  type ProgressSummaryDto,
  type ProgressSummaryQuery,
} from '@/progress/domain/progress-summary.query';
import { type UserId } from '@/shared/domain/user-id';

interface StatsRow {
  total_attempts: string;
  weak_count: string;
  mastered_count: string;
  accuracy_7d: string | null;
  last_played_at: Date | null;
}

interface StreakRow {
  current_streak: number;
  longest_streak: number;
}

interface GamesRow {
  games_completed: string;
}

@Injectable()
export class TypeOrmProgressSummaryQuery implements ProgressSummaryQuery {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByUserId(userId: UserId): Promise<ProgressSummaryDto> {
    const [statsRows, streakRows, gamesRows] = await Promise.all([
      this.dataSource.query<StatsRow[]>(
        `SELECT
           COALESCE(SUM(ufs.times_played + ufs.times_studied), 0)::int AS total_attempts,
           COUNT(*) FILTER (
             WHERE ufs.times_played > 0
               AND (ufs.times_played - ufs.correct_count) > 0
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
      this.dataSource.query<StreakRow[]>(
        `SELECT current_streak, longest_streak
         FROM users
         WHERE id = $1`,
        [userId.value],
      ),
      this.dataSource.query<GamesRow[]>(
        `SELECT COUNT(*)::int AS games_completed
         FROM games
         WHERE user_id = $1 AND status = 'completed' AND mode = 'game'`,
        [userId.value],
      ),
    ]);

    const stats = statsRows[0];
    const streak = streakRows[0];
    const games = gamesRows[0];

    return {
      currentStreak: streak?.current_streak ?? 0,
      longestStreak: streak?.longest_streak ?? 0,
      accuracy7d: Number(stats?.accuracy_7d ?? 0),
      totalAttempts: Number(stats?.total_attempts ?? 0),
      weakCount: Number(stats?.weak_count ?? 0),
      masteredCount: Number(stats?.mastered_count ?? 0),
      gamesCompleted: Number(games?.games_completed ?? 0),
      lastPlayedAt: stats?.last_played_at
        ? stats.last_played_at.toISOString()
        : null,
    };
  }
}
