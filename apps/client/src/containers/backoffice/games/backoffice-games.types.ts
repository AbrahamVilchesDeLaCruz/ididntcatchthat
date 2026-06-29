export type GameStatsPeriod = '24h' | '7d' | '15d' | '30d' | '6m' | 'all';

export interface GamesByModuleVM {
  module: string;
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
}

export interface GamesByPeriodVM {
  date: string;
  started: number;
  completed: number;
}

export interface GamesByModeVM {
  mode: string;
  count: number;
}

export interface GamesStatsVM {
  period: GameStatsPeriod;
  totalGames: number;
  completedGames: number;
  completionRate: number;
  avgAccuracy: number;
  totalAttempts: number;
  byModule: GamesByModuleVM[];
  byPeriod: GamesByPeriodVM[];
  byMode: GamesByModeVM[];
}
