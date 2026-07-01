import { GameModule, GameModuleValue } from '@/gaming/domain/game-module';
import { MotherCreator } from '@test/shared/domain/mother-creator';

const GAME_MODULE_VALUES = Object.values(GameModuleValue);

export class GameModuleMother {
  static random(): GameModule {
    const value =
      MotherCreator.random().helpers.arrayElement(GAME_MODULE_VALUES);
    return GameModule.create(value);
  }

  static nativeSounds(): GameModule {
    return GameModule.create(GameModuleValue.NativeSounds);
  }

  static connectedSpeech(): GameModule {
    return GameModule.create(GameModuleValue.ConnectedSpeech);
  }

  static invalid(): string {
    return 'invalid_module';
  }
}
