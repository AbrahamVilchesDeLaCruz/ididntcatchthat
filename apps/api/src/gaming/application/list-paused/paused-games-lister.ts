import { Inject, Injectable } from '@nestjs/common';
import { type GamePrimitives } from '@/gaming/domain/game';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';
import { Criteria } from '@/shared/domain/criteria';

export interface RequestPausedGamesLister {
  userId: string;
}

@Injectable()
export class PausedGamesLister {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(request: RequestPausedGamesLister): Promise<GamePrimitives[]> {
    const criteria = new Criteria([
      { field: 'userId', operator: '=', value: request.userId },
      { field: 'status', operator: '=', value: 'paused' },
    ]);
    const games = await this.gameRepository.match(criteria);
    return games.map((g) => g.toPrimitives());
  }
}
