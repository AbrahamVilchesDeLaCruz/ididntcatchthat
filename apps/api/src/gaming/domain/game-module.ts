import { StringValueObject } from '@/shared/domain/string-value-object';
import { GameModuleInvalid } from './exceptions/game-module-invalid';

export enum GameModuleValue {
  NativeSounds = 'native_sounds',
  ConnectingWords = 'connecting_words',
  BeautifyingSentences = 'beautifying_sentences',
  SoundingNative = 'sounding_native',
  Random = 'random',
}

const GAME_MODULES = Object.values(GameModuleValue);

export class GameModule extends StringValueObject {
  private constructor(value: GameModuleValue) {
    super(value);
  }

  static create(value: string): GameModule {
    if (!GAME_MODULES.includes(value as GameModuleValue)) {
      throw new GameModuleInvalid(value);
    }
    return new GameModule(value as GameModuleValue);
  }
}
