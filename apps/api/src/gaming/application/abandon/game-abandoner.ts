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

export interface RequestGameAbandoner {
  gameId: string;
  userId: string;
}

@Injectable()
export class GameAbandoner {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(request: RequestGameAbandoner): Promise<void> {
    const game = await this.gameRepository.search(new GameId(request.gameId));
    if (!game) throw new GameNotFound(request.gameId);

    if (game.toPrimitives().userId !== request.userId) {
      throw new GameAccessDenied(request.gameId);
    }

    game.abandon();
    await this.gameRepository.save(game);
    await this.publisher.publish(game.pullDomainEvents());
  }
}
