import { StringValueObject } from '@/shared/domain/string-value-object';
import { GameStatusInvalid } from './exceptions/game-status-invalid';

export enum GameStatusValue {
  InProgress = 'in_progress',
  Paused = 'paused',
  Completed = 'completed',
  Abandoned = 'abandoned',
}

const GAME_STATUSES = Object.values(GameStatusValue);

export class GameStatus extends StringValueObject {
  constructor(value: GameStatusValue) {
    if (!GAME_STATUSES.includes(value)) {
      throw new GameStatusInvalid(value);
    }
    super(value);
  }

  isInProgress(): boolean {
    return (this.value as GameStatusValue) === GameStatusValue.InProgress;
  }

  isPaused(): boolean {
    return (this.value as GameStatusValue) === GameStatusValue.Paused;
  }

  isFinished(): boolean {
    return (
      (this.value as GameStatusValue) === GameStatusValue.Completed ||
      (this.value as GameStatusValue) === GameStatusValue.Abandoned
    );
  }

  static create(value: string): GameStatus {
    return new GameStatus(value as GameStatusValue);
  }
}
