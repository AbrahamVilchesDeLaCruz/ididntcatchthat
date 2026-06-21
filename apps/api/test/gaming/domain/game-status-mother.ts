import { GameStatus, GameStatusValue } from '@/gaming/domain/game-status';
import { MotherCreator } from '@test/shared/domain/mother-creator';

const GAME_STATUS_VALUES = Object.values(GameStatusValue);

export class GameStatusMother {
  static random(): GameStatus {
    const value =
      MotherCreator.random().helpers.arrayElement(GAME_STATUS_VALUES);
    return GameStatus.create(value);
  }

  static inProgress(): GameStatus {
    return GameStatus.create(GameStatusValue.InProgress);
  }

  static paused(): GameStatus {
    return GameStatus.create(GameStatusValue.Paused);
  }

  static invalid(): string {
    return 'unknown';
  }
}
