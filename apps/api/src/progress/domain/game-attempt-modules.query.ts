export interface GameAttemptModulesQuery {
  findModulesByGameId(gameId: string): Promise<string[]>;
}

export const GAME_ATTEMPT_MODULES_QUERY = Symbol('GameAttemptModulesQuery');
