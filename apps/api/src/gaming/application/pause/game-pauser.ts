import { Inject, Injectable } from '@nestjs/common';
import { GameId } from '@/gaming/domain/game-id';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { type RequestGamePauser } from './request-game-pauser';

export type { RequestGamePauser };

@Injectable()
export class GamePauser {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly repository: GameRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestGamePauser): Promise<void> {
    const { gameId, userId, lastFlashcardId } = request;

    const game = await this.repository.search(new GameId(gameId));
    if (!game) throw new GameNotFound(gameId);

    if (game.userId !== userId) {
      throw new GameAccessDenied(gameId);
    }

    game.pause(lastFlashcardId);
    await this.repository.save(game);
    await this.publisher.publish(game.pullDomainEvents());

    this.logger.info('Game paused', { gameId, userId, lastFlashcardId });
  }
}
