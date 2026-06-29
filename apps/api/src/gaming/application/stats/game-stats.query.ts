import {
  type ResponseGameStatsRetriever,
  type StatPeriod,
} from './response-game-stats-retriever';

export const GAME_STATS_QUERY = Symbol('GAME_STATS_QUERY');

export interface GameStatsQuery {
  execute(period: StatPeriod): Promise<ResponseGameStatsRetriever>;
}
