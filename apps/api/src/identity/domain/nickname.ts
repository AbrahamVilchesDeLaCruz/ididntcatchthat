import { StringValueObject } from '@/shared/domain/string-value-object';
import { NicknameInvalid } from '@/identity/domain/nickname-invalid';

// 3–30 chars, alphanumeric + hyphen, no leading/trailing hyphen
const NICKNAME_REGEX =
  /^[a-zA-Z0-9][a-zA-Z0-9-]{1,28}[a-zA-Z0-9]$|^[a-zA-Z0-9]{3}$/;

export class Nickname extends StringValueObject {
  constructor(value: string) {
    super(value);

    if (!NICKNAME_REGEX.test(value)) {
      throw new NicknameInvalid(value);
    }
  }
}
