import { MotherCreator } from '@test/shared/domain/mother-creator';
import { Nickname } from '@/identity/user/domain/nickname';

export class NicknameMother {
  static random(): Nickname {
    // 3–30 chars, alphanumeric + hyphen — faker username may have dots, sanitize
    const raw = MotherCreator.random()
      .internet.username()
      .replace(/[^a-zA-Z0-9-]/g, '')
      .slice(0, 30);
    const safe = raw.length >= 3 ? raw : raw.padEnd(3, '0');
    return new Nickname(safe);
  }

  static withValue(value: string): Nickname {
    return new Nickname(value);
  }

  static invalid(): string {
    return 'x'; // too short
  }
}
