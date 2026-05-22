import { StringValueObject } from '@/shared/domain/string-value-object';
import { PasswordHashEmpty } from '@/identity/domain/password-hash-empty';

export class PasswordHash extends StringValueObject {
  constructor(value: string) {
    super(value);

    if (!value?.trim()) {
      throw new PasswordHashEmpty();
    }
  }
}
