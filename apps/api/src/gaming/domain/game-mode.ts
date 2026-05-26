import { StringValueObject } from '@/shared/domain/string-value-object';
import { DomainException } from '@/shared/domain/exceptions/domain-exception';

const GAME_MODES = ['study', 'game'] as const;
type GameModeValue = (typeof GAME_MODES)[number];

export class GameModeInvalid extends DomainException {
  constructor(value: string) {
    super(
      `GameMode value <${value}> is invalid. Must be one of: ${GAME_MODES.join(', ')}`,
    );
  }
}

export class GameMode extends StringValueObject {
  private constructor(value: GameModeValue) {
    super(value);
  }

  static create(value: string): GameMode {
    if (!GAME_MODES.includes(value as GameModeValue)) {
      throw new GameModeInvalid(value);
    }
    return new GameMode(value as GameModeValue);
  }
}
