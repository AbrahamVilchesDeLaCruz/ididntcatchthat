import { mock } from 'jest-mock-extended';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { GameSummaryFinder } from '@/gaming/application/summary/game-summary-finder';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { GameNotFinished } from '@/gaming/domain/exceptions/game-not-finished';
import { GameMother } from '@test/gaming/domain/game-mother';

describe('gaming/application/summary GameSummaryFinder', () => {
  const repository = mock<GameRepository>();
  let finder: GameSummaryFinder;

  beforeEach(() => {
    repository.search.mockReset();
    finder = new GameSummaryFinder(repository);
  });

  it('should return summary when all flashcards have attempts', async () => {
    const game = GameMother.random({ flashcardIds: ['fc-1', 'fc-2'] });
    game.recordAttempt('fc-1', true);
    game.recordAttempt('fc-2', false);
    game.pullDomainEvents();
    const primitives = game.toPrimitives();
    repository.search.mockResolvedValue(game);

    const result = await finder.execute({
      gameId: primitives.id,
      userId: primitives.userId,
    });

    expect(result.totalCount).toBe(2);
    expect(result.correctCount).toBe(1);
    expect(result.accuracy).toBe(50);
  });

  it('should return summary for completed game', async () => {
    const game = GameMother.random({ flashcardIds: ['fc-1'] });
    game.recordAttempt('fc-1', true);
    game.pullDomainEvents();
    game.complete();
    game.pullDomainEvents();
    const primitives = game.toPrimitives();
    repository.search.mockResolvedValue(game);

    const result = await finder.execute({
      gameId: primitives.id,
      userId: primitives.userId,
    });

    expect(result.totalCount).toBe(1);
    expect(result.correctCount).toBe(1);
    expect(result.accuracy).toBe(100);
  });

  it('should throw GameNotFound when game does not exist', async () => {
    repository.search.mockResolvedValue(null);

    await expect(
      finder.execute({
        gameId: '00000000-0000-4000-8000-000000000001',
        userId: 'user-1',
      }),
    ).rejects.toThrow(GameNotFound);
  });

  it('should throw GameAccessDenied when userId does not match', async () => {
    const game = GameMother.random({ userId: 'owner' });
    repository.search.mockResolvedValue(game);

    await expect(
      finder.execute({ gameId: game.toPrimitives().id, userId: 'other' }),
    ).rejects.toThrow(GameAccessDenied);
  });

  it('should throw GameNotFinished when pending flashcards remain', async () => {
    const game = GameMother.random({ flashcardIds: ['fc-1', 'fc-2'] });
    game.recordAttempt('fc-1', true);
    game.pullDomainEvents();
    const primitives = game.toPrimitives();
    repository.search.mockResolvedValue(game);

    await expect(
      finder.execute({
        gameId: primitives.id,
        userId: primitives.userId,
      }),
    ).rejects.toThrow(GameNotFinished);
  });
});
