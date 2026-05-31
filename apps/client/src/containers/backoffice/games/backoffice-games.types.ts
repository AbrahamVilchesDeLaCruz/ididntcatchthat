// ─── ViewModel types ──────────────────────────────────────────────────────────

export interface GamesByModuleVM {
  module: string;
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
}

export interface GamesStatsVM {
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
  totalAttempts: number;
  byModule: GamesByModuleVM[];
}
