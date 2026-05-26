import { StringValueObject } from '@/shared/domain/string-value-object';
import { DomainException } from '@/shared/domain/exceptions/domain-exception';

const GAME_STATUSES = [
  'in_progress',
  'paused',
  'completed',
  'abandoned',
] as const;
type GameStatusValue = (typeof GAME_STATUSES)[number];

export class GameStatusInvalid extends DomainException {
  constructor(value: string) {
    super(
      `GameStatus value <${value}> is invalid. Must be one of: ${GAME_STATUSES.join(', ')}`,
    );
  }
}

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
