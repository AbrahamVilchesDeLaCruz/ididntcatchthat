import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { GameIdInvalid } from './exceptions/game-id-invalid';

export class GameId extends UuidValueObject {
  constructor(value: string) {
    if (!UuidValueObject.isValid(value)) {
      throw new GameIdInvalid(value);
    }
    super(value);
  }

  static generate(): GameId {
    return new GameId(UuidValueObject.random());
  }
}
