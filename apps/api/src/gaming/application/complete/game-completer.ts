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
import { type RequestGameCompleter } from './request-game-completer';
import { type ResponseGameCompleter } from './response-game-completer';

export type { RequestGameCompleter, ResponseGameCompleter };

@Injectable()
export class GameCompleter {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestGameCompleter): Promise<ResponseGameCompleter> {
    const { gameId, userId } = request;

    const game = await this.gameRepository.search(new GameId(gameId));
    if (!game) throw new GameNotFound(gameId);

    if (game.userId !== userId) {
      throw new GameAccessDenied(gameId);
    }

    game.complete();

    await this.gameRepository.save(game);
    await this.publisher.publish(game.pullDomainEvents());

    const stats = game.completionStats();

    this.logger.info('Game completed', {
      gameId,
      userId,
      totalAttempts: stats.totalAttempts,
      correctCount: stats.correctCount,
    });

    return stats;
  }
}
