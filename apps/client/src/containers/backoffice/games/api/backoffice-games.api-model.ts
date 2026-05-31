// ─── Raw API models ───────────────────────────────────────────────────────────

export interface GamesByModuleApiModel {
  module: string | null;
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
}

export interface GamesStatsApiModel {
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
  totalAttempts: number;
  byModule: GamesByModuleApiModel[];
}
