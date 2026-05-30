import { StringValueObject } from '@/shared/domain/string-value-object';
import { GameModuleInvalid } from './exceptions/game-module-invalid';

const GAME_MODULES = [
  'native_sounds',
  'connecting_words',
  'beautifying_sentences',
  'sounding_native',
  'random',
] as const;
export type GameModuleValue = (typeof GAME_MODULES)[number];

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
