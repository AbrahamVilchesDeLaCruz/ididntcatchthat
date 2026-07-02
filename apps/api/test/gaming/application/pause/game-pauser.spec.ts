import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { GamePauser } from '@/gaming/application/pause/game-pauser';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { GameNotInProgress } from '@/gaming/domain/exceptions/game-not-in-progress';
import { GamePausedEvent } from '@/gaming/domain/events/game-paused.event';
import { GameMother } from '@test/gaming/domain/game-mother';
import { RequestGamePauserMother } from './request-game-pauser-mother';

describe('gaming/application/pause GamePauser', () => {
  const repository = mock<GameRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let pauser: GamePauser;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    publisher.publish.mockReset();
    publisher.publish.mockResolvedValue(undefined);
    pauser = new GamePauser(repository, publisher, logger);
  });

  it('should pause an in-progress game', async () => {
    const game = GameMother.random({ flashcardIds: ['fc-1', 'fc-2'] });
    const primitives = game.toPrimitives();
    repository.search.mockResolvedValue(game);
    repository.save.mockResolvedValue(undefined);

    await pauser.execute(
      RequestGamePauserMother.random(primitives.id, {
        userId: primitives.userId!,
        lastFlashcardId: 'fc-1',
      }),
    );

    expect(repository.save).toHaveBeenCalledTimes(1);
    const savedGame = repository.save.mock.calls[0][0];
    expect(savedGame.toPrimitives().status).toBe('paused');
    expect(savedGame.toPrimitives().lastFlashcardId).toBe('fc-1');
    const events = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(GamePausedEvent);
  });

  it('should throw GameNotFound when game does not exist', async () => {
    repository.search.mockResolvedValue(null);

    await expect(
      pauser.execute(RequestGamePauserMother.random()),
    ).rejects.toThrow(GameNotFound);
  });

  it('should throw GameAccessDenied when userId does not match', async () => {
    const game = GameMother.random({ userId: 'owner' });
    repository.search.mockResolvedValue(game);

    await expect(
      pauser.execute(
        RequestGamePauserMother.random(game.toPrimitives().id, {
          userId: 'other',
        }),
      ),
    ).rejects.toThrow(GameAccessDenied);
  });

  it('should throw GameNotInProgress when game is already paused', async () => {
    const game = GameMother.paused();
    const primitives = game.toPrimitives();
    repository.search.mockResolvedValue(game);

    await expect(
      pauser.execute(
        RequestGamePauserMother.random(primitives.id, {
          userId: primitives.userId!,
        }),
      ),
    ).rejects.toThrow(GameNotInProgress);
  });
});
