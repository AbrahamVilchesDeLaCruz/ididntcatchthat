export interface GameModuleQuery {
  getModule(gameId: string): Promise<string | null>;
}

export const GAME_MODULE_QUERY = Symbol('GameModuleQuery');
