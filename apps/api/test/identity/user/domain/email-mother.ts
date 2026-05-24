import { MotherCreator } from '@test/shared/domain/mother-creator';
import { Email } from '@/identity/user/domain/email';

export class EmailMother {
  static random(): Email {
    return new Email(MotherCreator.random().internet.email());
  }

  static withValue(value: string): Email {
    return new Email(value);
  }

  static invalid(): string {
    return 'not-an-email';
  }
}
