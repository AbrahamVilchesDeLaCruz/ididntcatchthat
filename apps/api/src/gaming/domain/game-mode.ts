import { StringValueObject } from '@/shared/domain/string-value-object';
import { GameModeInvalid } from './exceptions/game-mode-invalid';

const GAME_MODES = ['study', 'game'] as const;
export type GameModeValue = (typeof GAME_MODES)[number];

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
