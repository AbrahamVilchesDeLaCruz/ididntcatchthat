export interface GamesByModuleApiModel {
  module: string | null;
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
}

export interface GamesByPeriodApiModel {
  date: string;
  started: number;
  completed: number;
}

export interface GamesByModeApiModel {
  mode: string;
  count: number;
}

export interface GamesStatsApiModel {
  period: string;
  totalGames: number;
  completedGames: number;
  completionRate: number;
  avgAccuracy: number;
  totalAttempts: number;
  byModule: GamesByModuleApiModel[];
  byPeriod: GamesByPeriodApiModel[];
  byMode: GamesByModeApiModel[];
}
