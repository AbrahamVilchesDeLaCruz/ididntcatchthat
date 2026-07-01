import { type UserId } from '@/shared/domain/user-id';

export type UserStreakSnapshot = {
  currentStreak: number;
  longestStreak: number;
};

/** Read port: streak fields owned by Identity (`users` table). */
export interface UserStreakQuery {
  findByUserId(userId: UserId): Promise<UserStreakSnapshot | null>;
}

export const USER_STREAK_QUERY = Symbol('UserStreakQuery');
