import { Inject, Injectable } from '@nestjs/common';
import { type GameStatsQuery, GAME_STATS_QUERY } from './game-stats.query';
import { type ResponseGameStatsRetriever } from './response-game-stats-retriever';

@Injectable()
export class GameStatsRetriever {
  constructor(
    @Inject(GAME_STATS_QUERY)
    private readonly query: GameStatsQuery,
  ) {}

  async execute(): Promise<ResponseGameStatsRetriever> {
    return this.query.execute();
  }
}
