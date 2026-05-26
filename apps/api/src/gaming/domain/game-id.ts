import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class GameIdInvalid extends DomainException {
  constructor(value: string) {
    super(`GameId value <${value}> is not a valid UUID`);
  }
}

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
