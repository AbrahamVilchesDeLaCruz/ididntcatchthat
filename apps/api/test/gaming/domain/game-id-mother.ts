import { GameId } from '@/gaming/domain/game-id';

export class GameIdMother {
  static random(): GameId {
    return GameId.generate();
  }

  static create(value: string): GameId {
    return new GameId(value);
  }
}
