import { PasswordHash } from '@/identity/domain/password-hash';
import { StringMother } from '@test/shared/domain/string-mother';

export class PasswordHashMother {
  static random(): PasswordHash {
    return new PasswordHash(`bcrypt$${StringMother.random()}`);
  }

  static withValue(value: string): PasswordHash {
    return new PasswordHash(value);
  }

  static invalid(): string {
    return '';
  }

  static whitespace(): string {
    return '   ';
  }
}
