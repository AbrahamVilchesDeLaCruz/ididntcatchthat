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
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';

export interface RequestGameCompleter {
  gameId: string;
  userId: string | null;
}

export interface GameSummary {
  correctCount: number;
  totalCount: number;
  accuracy: number;
  duration: number;
}

@Injectable()
export class GameCompleter {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(request: RequestGameCompleter): Promise<GameSummary> {
    const game = await this.gameRepository.search(new GameId(request.gameId));
    if (!game) throw new GameNotFound(request.gameId);

    if (game.toPrimitives().userId !== request.userId) {
      throw new GameAccessDenied(request.gameId);
    }

    game.complete();

    await this.gameRepository.save(game);
    await this.publisher.publish(game.pullDomainEvents());

    const primitives = game.toPrimitives();
    const totalCount = primitives.attempts.length;
    const correctCount = primitives.attempts.filter((a) => a.correct).length;
    const accuracy =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const duration = primitives.finishedAt
      ? Math.round(
          (primitives.finishedAt.getTime() - primitives.startedAt.getTime()) /
            1000,
        )
      : 0;

    return { correctCount, totalCount, accuracy, duration };
  }
}
