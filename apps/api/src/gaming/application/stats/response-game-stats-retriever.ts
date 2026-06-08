export type GameStatsByModule = {
  module: string | null;
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
};

export type ResponseGameStatsRetriever = {
  totalGames: number;
  completedGames: number;
  avgAccuracy: number;
  totalAttempts: number;
  byModule: GameStatsByModule[];
};
