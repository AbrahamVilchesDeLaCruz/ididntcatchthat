import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { UserIdInvalid } from '@/identity/domain/user-id-invalid';

export class UserId extends UuidValueObject {
  constructor(value: string) {
    super(value);
    this.ensureIsValid(value);
  }

  static generate(): UserId {
    return new UserId(UuidValueObject.random());
  }

  private ensureIsValid(value: string): void {
    if (!UuidValueObject.isValid(value)) {
      throw new UserIdInvalid(value);
    }
  }
}
