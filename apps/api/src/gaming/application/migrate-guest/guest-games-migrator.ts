import { Inject, Injectable } from '@nestjs/common';
import { GameId } from '@/gaming/domain/game-id';
import {
  type GameRepository,
  GAME_REPOSITORY,
} from '@/gaming/domain/game.repository';

@Injectable()
export class GuestGamesMigrator {
  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly repository: GameRepository,
  ) {}

  async execute(userId: string, gameIds: string[]): Promise<void> {
    if (gameIds.length === 0) return;

    for (const gameId of gameIds) {
      const game = await this.repository.search(new GameId(gameId));
      if (game?.userId !== null) continue;

      const migrated = game.assignToUser(userId);
      await this.repository.save(migrated);
    }
  }
}
