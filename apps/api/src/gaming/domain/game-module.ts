import { StringValueObject } from '@/shared/domain/string-value-object';
import { GameModuleInvalid } from './exceptions/game-module-invalid';

export enum GameModuleValue {
  NativeSounds = 'native_sounds',
  ConnectedSpeech = 'connected_speech',
  FlowConnectors = 'flow_connectors',
  RealTalk = 'real_talk',
  Random = 'random',
}

const GAME_MODULES = Object.values(GameModuleValue);

export class GameModule extends StringValueObject {
  public constructor(value: GameModuleValue) {
    super(value);
  }

  static create(value: string): GameModule {
    if (!GAME_MODULES.includes(value as GameModuleValue)) {
      throw new GameModuleInvalid(value);
    }
    return new GameModule(value as GameModuleValue);
  }
}
