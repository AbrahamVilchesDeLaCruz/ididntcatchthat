import { MotherCreator } from './mother-creator';

export class StringMother {
  static random(): string {
    return MotherCreator.random().lorem.word();
  }

  static sentence(): string {
    return MotherCreator.random().lorem.sentence();
  }

  static ofLength(length: number): string {
    return MotherCreator.random().string.alpha({ length });
  }

  static email(): string {
    return MotherCreator.random().internet.email().toLowerCase();
  }

  static alphanumeric(length: number): string {
    return MotherCreator.random().string.alphanumeric({ length });
  }
}
