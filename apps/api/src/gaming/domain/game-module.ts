import { StringValueObject } from '@/shared/domain/string-value-object';
import { DomainException } from '@/shared/domain/exceptions/domain-exception';

const GAME_MODULES = [
  'native_sounds',
  'connecting_words',
  'beautifying_sentences',
  'sounding_native',
  'random',
] as const;
type GameModuleValue = (typeof GAME_MODULES)[number];

export class GameModuleInvalid extends DomainException {
  constructor(value: string) {
    super(
      `GameModule value <${value}> is invalid. Must be one of: ${GAME_MODULES.join(', ')}`,
    );
  }
}

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
