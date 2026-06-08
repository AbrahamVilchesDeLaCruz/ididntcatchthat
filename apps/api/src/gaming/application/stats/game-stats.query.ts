import { type ResponseGameStatsRetriever } from './response-game-stats-retriever';

export const GAME_STATS_QUERY = Symbol('GAME_STATS_QUERY');

export interface GameStatsQuery {
  execute(): Promise<ResponseGameStatsRetriever>;
}
