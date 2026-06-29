import type {
  GamesStatsApiModel,
  GamesByModuleApiModel,
} from './api/backoffice-games.api-model';
import type {
  GamesStatsVM,
  GamesByModuleVM,
  GameStatsPeriod,
} from './backoffice-games.types';

function mapGamesByModule(raw: GamesByModuleApiModel): GamesByModuleVM {
  return {
    module: raw.module ?? 'Sin módulo',
    totalGames: raw.totalGames,
    completedGames: raw.completedGames,
    avgAccuracy: raw.avgAccuracy,
  };
}

export function mapGamesStats(raw: GamesStatsApiModel): GamesStatsVM {
  return {
    period: raw.period as GameStatsPeriod,
    totalGames: raw.totalGames,
    completedGames: raw.completedGames,
    completionRate: raw.completionRate,
    avgAccuracy: raw.avgAccuracy,
    totalAttempts: raw.totalAttempts,
    byModule: raw.byModule.map(mapGamesByModule),
    byPeriod: raw.byPeriod,
    byMode: raw.byMode,
  };
}
