import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { GameCompleter } from '@/gaming/application/complete/game-completer';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { GameNotFinished } from '@/gaming/domain/exceptions/game-not-finished';
import { GameCompletedEvent } from '@/gaming/domain/events/game-completed.event';
import { GameMother } from '@test/gaming/domain/game-mother';
import { RequestGameCompleterMother } from './request-game-completer-mother';

describe('gaming/application/complete GameCompleter', () => {
  const gameRepository = mock<GameRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let completer: GameCompleter;

  beforeEach(() => {
    gameRepository.search.mockReset();
    gameRepository.save.mockReset();
    publisher.publish.mockReset();
    logger.info.mockReset();
    logger.warn.mockReset();
    publisher.publish.mockResolvedValue(undefined);
    completer = new GameCompleter(gameRepository, publisher, logger);
  });

  it('should complete a game and return summary', async () => {
    const flashcardIds = ['fc-1', 'fc-2'];
    const game = GameMother.random({ flashcardIds });
    game.recordAttempt('fc-1', true);
    game.recordAttempt('fc-2', false);
    game.pullDomainEvents();
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);
    gameRepository.save.mockResolvedValue(undefined);

    const result = await completer.execute(
      RequestGameCompleterMother.random(primitives.id, {
        userId: primitives.userId,
      }),
    );

    expect(result.totalCount).toBe(2);
    expect(result.correctCount).toBe(1);
    expect(result.accuracy).toBe(50);
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(gameRepository.save).toHaveBeenCalledTimes(1);
    const events = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(GameCompletedEvent);
  });

  it('should throw GameNotFound when game does not exist', async () => {
    gameRepository.search.mockResolvedValue(null);

    await expect(
      completer.execute(RequestGameCompleterMother.random()),
    ).rejects.toThrow(GameNotFound);
  });

  it('should throw GameAccessDenied when userId does not match', async () => {
    const game = GameMother.random({ userId: 'owner' });
    gameRepository.search.mockResolvedValue(game);

    await expect(
      completer.execute(
        RequestGameCompleterMother.random(game.toPrimitives().id, {
          userId: 'other',
        }),
      ),
    ).rejects.toThrow(GameAccessDenied);
  });

  it('should throw GameNotFinished when there are pending flashcards', async () => {
    const game = GameMother.random({ flashcardIds: ['fc-1', 'fc-2'] });
    game.recordAttempt('fc-1', true);
    game.pullDomainEvents();
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);

    await expect(
      completer.execute(
        RequestGameCompleterMother.random(primitives.id, {
          userId: primitives.userId,
        }),
      ),
    ).rejects.toThrow(GameNotFinished);
  });

  it('should publish GameCompletedEvent', async () => {
    const game = GameMother.random({ flashcardIds: ['fc-1'] });
    game.recordAttempt('fc-1', true);
    game.pullDomainEvents();
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);
    gameRepository.save.mockResolvedValue(undefined);

    await completer.execute(
      RequestGameCompleterMother.random(primitives.id, {
        userId: primitives.userId,
      }),
    );

    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });
});
