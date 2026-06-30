import { type UserId } from '@/shared/domain/user-id';

export interface CompletedGamesCountQuery {
  countCompletedGames(userId: UserId): Promise<number>;
  countCompletedStudySessions(userId: UserId): Promise<number>;
}

export const COMPLETED_GAMES_COUNT_QUERY = Symbol('CompletedGamesCountQuery');
