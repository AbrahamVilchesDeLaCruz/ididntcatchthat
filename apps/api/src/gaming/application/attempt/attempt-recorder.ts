import { Inject, Injectable } from '@nestjs/common';
import { GameId } from '@/gaming/domain/game-id';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import {
  type AttemptRepository,
  ATTEMPT_REPOSITORY,
} from '@/gaming/domain/attempt.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import {
  type FlashcardCategoryQuery,
  FLASHCARD_CATEGORY_QUERY,
} from '@/gaming/domain/flashcard-category.query';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { type RequestAttemptRecorder } from './request-attempt-recorder';

export type { RequestAttemptRecorder };

@Injectable()
export class AttemptRecorder {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(ATTEMPT_REPOSITORY)
    private readonly attemptRepository: AttemptRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(FLASHCARD_CATEGORY_QUERY)
    private readonly flashcardCategoryQuery: FlashcardCategoryQuery,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestAttemptRecorder): Promise<void> {
    const { gameId, flashcardId, correct, userId } = request;

    const game = await this.gameRepository.search(new GameId(gameId));
    if (!game) throw new GameNotFound(gameId);

    if (game.userId !== userId) {
      throw new GameAccessDenied(gameId);
    }

    const flashcardModule =
      await this.flashcardCategoryQuery.findCategoryByFlashcardId(flashcardId);
    const attempt = game.recordAttempt(flashcardId, correct, flashcardModule);

    await this.attemptRepository.save(attempt);
    await this.gameRepository.save(game);
    await this.publisher.publish(game.pullDomainEvents());

    this.logger.info('Attempt recorded', {
      gameId,
      flashcardId,
      correct,
      userId,
    });
  }
}
