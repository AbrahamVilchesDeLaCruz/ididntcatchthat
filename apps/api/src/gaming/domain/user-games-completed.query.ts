import { type UserId } from '@/shared/domain/user-id';

/** Read port: completed game-mode sessions for a user (Gaming owns `games` table). */
export interface UserGamesCompletedQuery {
  countCompletedGameMode(userId: UserId): Promise<number>;
}

export const USER_GAMES_COMPLETED_QUERY = Symbol('UserGamesCompletedQuery');
