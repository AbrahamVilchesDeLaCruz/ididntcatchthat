import { StringValueObject } from '@/shared/domain/string-value-object';
import { PasswordHashEmptyException } from '@/identity/domain/exceptions/password-hash-empty.exception';

export class PasswordHash extends StringValueObject {
  constructor(value: string) {
    super(value);

    if (!value?.trim()) {
      throw new PasswordHashEmptyException();
    }
  }
}
