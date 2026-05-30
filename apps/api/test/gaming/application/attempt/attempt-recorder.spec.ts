import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { type AttemptRepository } from '@/gaming/domain/attempt.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { AttemptRecorder } from '@/gaming/application/attempt/attempt-recorder';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { GameNotInProgress } from '@/gaming/domain/exceptions/game-not-in-progress';
import { FlashcardNotInGame } from '@/gaming/domain/exceptions/flashcard-not-in-game';
import { AttemptRecordedEvent } from '@/gaming/domain/events/attempt-recorded.event';
import { Attempt } from '@/gaming/domain/attempt';
import { GameMother } from '@test/gaming/domain/game-mother';
import { RequestAttemptRecorderMother } from './request-attempt-recorder-mother';

describe('gaming/application/attempt AttemptRecorder', () => {
  const gameRepository = mock<GameRepository>();
  const attemptRepository = mock<AttemptRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let recorder: AttemptRecorder;

  beforeEach(() => {
    gameRepository.search.mockReset();
    gameRepository.save.mockReset();
    attemptRepository.save.mockReset();
    publisher.publish.mockReset();
    logger.info.mockReset();
    logger.warn.mockReset();
    publisher.publish.mockResolvedValue(undefined);
    gameRepository.save.mockResolvedValue(undefined);
    attemptRepository.save.mockResolvedValue(undefined);
    recorder = new AttemptRecorder(
      gameRepository,
      attemptRepository,
      publisher,
      logger,
    );
  });

  it('should record an attempt, persist it and publish AttemptRecordedEvent', async () => {
    const game = GameMother.inProgress({ flashcardIds: ['fc-1', 'fc-2'] });
    const primitives = game.toPrimitives();
    const request = RequestAttemptRecorderMother.random(primitives.id, {
      flashcardId: 'fc-1',
      userId: primitives.userId,
    });
    gameRepository.search.mockResolvedValue(game);

    await recorder.execute(request);

    expect(attemptRepository.save).toHaveBeenCalledTimes(1);
    const savedAttempt = attemptRepository.save.mock.calls[0][0];
    expect(savedAttempt).toBeInstanceOf(Attempt);
    expect(savedAttempt.flashcardId).toBe('fc-1');

    expect(gameRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = publisher.publish.mock.calls[0][0];
    expect(publishedEvents[0]).toBeInstanceOf(AttemptRecordedEvent);
  });

  it('should throw GameNotFound when game does not exist', async () => {
    gameRepository.search.mockResolvedValue(null);
    const request = RequestAttemptRecorderMother.random();

    await expect(recorder.execute(request)).rejects.toThrow(GameNotFound);
    expect(attemptRepository.save).not.toHaveBeenCalled();
    expect(gameRepository.save).not.toHaveBeenCalled();
  });

  it('should throw GameAccessDenied when userId does not match', async () => {
    const game = GameMother.inProgress({ userId: 'owner-user' });
    gameRepository.search.mockResolvedValue(game);
    const request = RequestAttemptRecorderMother.random(
      game.toPrimitives().id,
      { userId: 'other-user' },
    );

    await expect(recorder.execute(request)).rejects.toThrow(GameAccessDenied);
    expect(attemptRepository.save).not.toHaveBeenCalled();
    expect(gameRepository.save).not.toHaveBeenCalled();
  });

  it('should throw GameNotInProgress when game is paused', async () => {
    const game = GameMother.paused();
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);
    const request = RequestAttemptRecorderMother.random(primitives.id, {
      userId: primitives.userId,
      flashcardId: primitives.flashcardIds[0],
    });

    await expect(recorder.execute(request)).rejects.toThrow(GameNotInProgress);
    expect(attemptRepository.save).not.toHaveBeenCalled();
    expect(gameRepository.save).not.toHaveBeenCalled();
  });

  it('should throw FlashcardNotInGame when flashcardId is not in game', async () => {
    const game = GameMother.inProgress({ flashcardIds: ['fc-1', 'fc-2'] });
    const primitives = game.toPrimitives();
    gameRepository.search.mockResolvedValue(game);
    const request = RequestAttemptRecorderMother.random(primitives.id, {
      userId: primitives.userId,
      flashcardId: 'fc-not-in-game',
    });

    await expect(recorder.execute(request)).rejects.toThrow(FlashcardNotInGame);
    expect(attemptRepository.save).not.toHaveBeenCalled();
    expect(gameRepository.save).not.toHaveBeenCalled();
  });
});
