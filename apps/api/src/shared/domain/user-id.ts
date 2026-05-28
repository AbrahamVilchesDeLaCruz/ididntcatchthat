import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { UserIdInvalid } from '@/shared/domain/exceptions/user-id-invalid';

export class UserId extends UuidValueObject {
  constructor(value: string) {
    if (!UuidValueObject.isValid(value)) {
      throw new UserIdInvalid(value);
    }
    super(value);
  }

  static generate(): UserId {
    return new UserId(UuidValueObject.random());
  }
}
