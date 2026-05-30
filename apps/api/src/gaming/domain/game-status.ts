import { StringValueObject } from '@/shared/domain/string-value-object';
import { GameStatusInvalid } from './exceptions/game-status-invalid';

const GAME_STATUSES = [
  'in_progress',
  'paused',
  'completed',
  'abandoned',
] as const;
export type GameStatusValue = (typeof GAME_STATUSES)[number];

export class GameStatus extends StringValueObject {
  private constructor(value: GameStatusValue) {
    super(value);
  }

  static create(value: string): GameStatus {
    if (!GAME_STATUSES.includes(value as GameStatusValue)) {
      throw new GameStatusInvalid(value);
    }
    return new GameStatus(value as GameStatusValue);
  }
}
