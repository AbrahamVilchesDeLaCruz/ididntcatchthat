import { type UserId } from '@/shared/domain/user-id';

export interface ProgressSummary {
  currentStreak: number;
  longestStreak: number;
  accuracy7d: number;
  totalAttempts: number;
  weakCount: number;
  masteredCount: number;
  gamesCompleted: number;
  lastPlayedAt: string | null;
}

export interface ProgressSummaryQuery {
  findByUserId(userId: UserId): Promise<ProgressSummary>;
}

export const PROGRESS_SUMMARY_QUERY = Symbol('ProgressSummaryQuery');
