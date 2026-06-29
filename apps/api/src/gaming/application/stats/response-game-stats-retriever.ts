export type StatPeriod = '24h' | '7d' | '15d' | '30d' | '6m' | 'all';

export type GameStatsByModule = {
  module: string | null;
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
};

export type GameStatsByPeriod = {
  date: string;
  started: number;
  completed: number;
};

export type GameStatsByMode = {
  mode: string;
  count: number;
};

export type ResponseGameStatsRetriever = {
  period: StatPeriod;
  totalGames: number;
  completedGames: number;
  completionRate: number;
  avgAccuracy: number;
  totalAttempts: number;
  byModule: GameStatsByModule[];
  byPeriod: GameStatsByPeriod[];
  byMode: GameStatsByMode[];
};
