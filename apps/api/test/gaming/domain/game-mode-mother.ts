import { GameMode, GameModeValue } from '@/gaming/domain/game-mode';
import { MotherCreator } from '@test/shared/domain/mother-creator';

const GAME_MODE_VALUES = Object.values(GameModeValue);

export class GameModeMother {
  static random(): GameMode {
    const value = MotherCreator.random().helpers.arrayElement(GAME_MODE_VALUES);
    return GameMode.create(value);
  }

  static study(): GameMode {
    return GameMode.create(GameModeValue.Study);
  }

  static game(): GameMode {
    return GameMode.create(GameModeValue.Game);
  }

  static invalid(): string {
    return 'invalid_mode';
  }
}
