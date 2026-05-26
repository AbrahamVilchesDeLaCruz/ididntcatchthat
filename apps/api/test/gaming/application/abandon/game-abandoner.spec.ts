import { mock } from 'jest-mock-extended';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { GameAbandoner } from '@/gaming/application/abandon/game-abandoner';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { GameAlreadyFinished } from '@/gaming/domain/exceptions/game-already-finished';
import { GameAbandonedEvent } from '@/gaming/domain/events/game-abandoned.event';
import { GameMother } from '@test/gaming/domain/game-mother';
import { RequestGameAbandonerMother } from './request-game-abandoner-mother';

describe('gaming/application/abandon GameAbandoner', () => {
  const gameRepository = mock<GameRepository>();
  const publisher = mock<DomainEventPublisher>();
  let abandoner: GameAbandoner;

  beforeEach(() => {
    gameRepository.search.mockReset();
    gameRepository.save.mockReset();
    publisher.publish.mockReset();
    publisher.publish.mockResolvedValue(undefined);
    abandoner = new GameAbandoner(gameRepository, publisher);
  });

  it('should abandon an in-progress game and publish event', async () => {
    const game = GameMother.random();
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);
    gameRepository.save.mockResolvedValue(undefined);

    await abandoner.execute(
      RequestGameAbandonerMother.random(primitives.id, {
        userId: primitives.userId!,
      }),
    );

    expect(gameRepository.save).toHaveBeenCalledTimes(1);
    const events = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(GameAbandonedEvent);
  });

  it('should abandon a paused game', async () => {
    const game = GameMother.paused();
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);
    gameRepository.save.mockResolvedValue(undefined);

    await abandoner.execute(
      RequestGameAbandonerMother.random(primitives.id, {
        userId: primitives.userId!,
      }),
    );

    expect(gameRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw GameNotFound when game does not exist', async () => {
    gameRepository.search.mockResolvedValue(null);

    await expect(
      abandoner.execute(RequestGameAbandonerMother.random()),
    ).rejects.toThrow(GameNotFound);
  });

  it('should throw GameAccessDenied when userId does not match', async () => {
    const game = GameMother.random({ userId: 'owner' });
    gameRepository.search.mockResolvedValue(game);

    await expect(
      abandoner.execute(
        RequestGameAbandonerMother.random(game.toPrimitives().id, {
          userId: 'other',
        }),
      ),
    ).rejects.toThrow(GameAccessDenied);
  });

  it('should throw GameAlreadyFinished when game is completed', async () => {
    const game = GameMother.completed();
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);

    await expect(
      abandoner.execute(
        RequestGameAbandonerMother.random(primitives.id, {
          userId: primitives.userId!,
        }),
      ),
    ).rejects.toThrow(GameAlreadyFinished);
  });
});
