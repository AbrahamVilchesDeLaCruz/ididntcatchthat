import { mock } from 'jest-mock-extended';
import { type GameStatsQuery } from '@/gaming/application/stats/game-stats.query';
import { GameStatsRetriever } from '@/gaming/application/stats/game-stats-retriever';
import { type ResponseGameStatsRetriever } from '@/gaming/application/stats/response-game-stats-retriever';

describe('gaming/application/stats GameStatsRetriever', () => {
  const query = mock<GameStatsQuery>();
  let retriever: GameStatsRetriever;

  beforeEach(() => {
    query.execute.mockReset();
    retriever = new GameStatsRetriever(query);
  });

  it('should return the result from the query', async () => {
    const expected: ResponseGameStatsRetriever = {
      totalGames: 10,
      completedGames: 7,
      avgAccuracy: 82.5,
      totalAttempts: 120,
      byModule: [
        {
          module: 'connected-speech',
          totalGames: 5,
          completedGames: 4,
          avgAccuracy: 85,
        },
        { module: null, totalGames: 5, completedGames: 3, avgAccuracy: 80 },
      ],
    };
    query.execute.mockResolvedValue(expected);

    const result = await retriever.execute();

    expect(result).toEqual(expected);
    expect(query.execute).toHaveBeenCalledTimes(1);
  });
});
