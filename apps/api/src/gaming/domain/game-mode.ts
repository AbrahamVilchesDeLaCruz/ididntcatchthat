import { StringValueObject } from '@/shared/domain/string-value-object';
import { GameModeInvalid } from './exceptions/game-mode-invalid';

export enum GameModeValue {
  Study = 'study',
  Game = 'game',
}

const GAME_MODES = Object.values(GameModeValue);

export class GameMode extends StringValueObject {
  private constructor(value: GameModeValue) {
    super(value);
  }

  isGame(): boolean {
    return (this.value as GameModeValue) === GameModeValue.Game;
  }

  isStudy(): boolean {
    return (this.value as GameModeValue) === GameModeValue.Study;
  }

  static create(value: string): GameMode {
    if (!GAME_MODES.includes(value as GameModeValue)) {
      throw new GameModeInvalid(value);
    }
    return new GameMode(value as GameModeValue);
  }
}
