import { StringValueObject } from '@/shared/domain/string-value-object';
import { EmailInvalid } from '@/identity/domain/email-invalid';

// RFC 5321 — max 254 chars, basic format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;

export class Email extends StringValueObject {
  constructor(value: string) {
    const normalized = value?.toLowerCase().trim();
    super(normalized);

    if (!EMAIL_REGEX.test(normalized) || normalized.length > EMAIL_MAX_LENGTH) {
      throw new EmailInvalid(value);
    }
  }
}
