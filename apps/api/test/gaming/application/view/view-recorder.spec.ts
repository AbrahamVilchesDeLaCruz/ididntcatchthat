import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { type GameRepository } from '@/gaming/domain/game.repository';
import { type ViewRepository } from '@/gaming/domain/view.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { ViewRecorder } from '@/gaming/application/view/view-recorder';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { type FlashcardCategoryQuery } from '@/gaming/domain/flashcard-category.query';
import { FlashcardViewedEvent } from '@/gaming/domain/events/flashcard-viewed.event';
import { View } from '@/gaming/domain/view';
import { GameMother } from '@test/gaming/domain/game-mother';
import { GameModeMother } from '@test/gaming/domain/game-mode-mother';

describe('gaming/application/view ViewRecorder', () => {
  const gameRepository = mock<GameRepository>();
  const viewRepository = mock<ViewRepository>();
  const publisher = mock<DomainEventPublisher>();
  const flashcardCategoryQuery = mock<FlashcardCategoryQuery>();
  const logger = mock<Logger>();
  let recorder: ViewRecorder;

  beforeEach(() => {
    gameRepository.search.mockReset();
    gameRepository.save.mockReset();
    viewRepository.save.mockReset();
    publisher.publish.mockReset();
    logger.info.mockReset();
    logger.warn.mockReset();
    publisher.publish.mockResolvedValue(undefined);
    gameRepository.save.mockResolvedValue(undefined);
    viewRepository.save.mockResolvedValue(undefined);
    flashcardCategoryQuery.findCategoryByFlashcardId.mockResolvedValue(
      'native_sounds',
    );
    recorder = new ViewRecorder(
      gameRepository,
      viewRepository,
      publisher,
      flashcardCategoryQuery,
      logger,
    );
  });

  it('should record a view, persist it and publish FlashcardViewedEvent', async () => {
    const game = GameMother.inStudyProgress({
      flashcardIds: ['fc-1'],
      mode: GameModeMother.study().value,
    });
    gameRepository.search.mockResolvedValue(game);

    await recorder.execute({
      gameId: game.toPrimitives().id,
      flashcardId: 'fc-1',
      userId: game.toPrimitives().userId,
    });

    expect(viewRepository.save).toHaveBeenCalledTimes(1);
    expect(viewRepository.save.mock.calls[0][0]).toBeInstanceOf(View);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(publisher.publish.mock.calls[0][0][0]).toBeInstanceOf(
      FlashcardViewedEvent,
    );
  });

  it('should throw GameNotFound when game does not exist', async () => {
    gameRepository.search.mockResolvedValue(null);

    await expect(
      recorder.execute({
        gameId: '00000000-0000-4000-8000-000000000001',
        flashcardId: 'fc-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow(GameNotFound);
  });

  it('should throw GameAccessDenied when userId does not match the game owner', async () => {
    const game = GameMother.inStudyProgress({
      flashcardIds: ['fc-1'],
      mode: GameModeMother.study().value,
    });
    gameRepository.search.mockResolvedValue(game);

    await expect(
      recorder.execute({
        gameId: game.toPrimitives().id,
        flashcardId: 'fc-1',
        userId: 'other-user',
      }),
    ).rejects.toThrow(GameAccessDenied);

    expect(viewRepository.save).not.toHaveBeenCalled();
  });
});
