import { Inject, Injectable } from '@nestjs/common';
import { type GamePrimitives } from '@/gaming/domain/game';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import { type RequestPausedGamesLister } from './request-paused-games-lister';

export type { RequestPausedGamesLister };

@Injectable()
export class PausedGamesLister {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly repository: GameRepository,
  ) {}

  async execute(request: RequestPausedGamesLister): Promise<GamePrimitives[]> {
    const { userId } = request;

    const criteria = new Criteria([
      { field: 'userId', operator: FilterOperator.EQ, value: userId },
      { field: 'status', operator: FilterOperator.EQ, value: 'paused' },
    ]);
    const games = await this.repository.match(criteria);
    return games.map((g) => g.toPrimitives());
  }
}
