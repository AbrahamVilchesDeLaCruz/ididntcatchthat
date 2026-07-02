import { MotherCreator } from '@test/shared/domain/mother-creator';

export class StreakCountMother {
  static random(): number {
    return MotherCreator.random().number.int({ min: 0, max: 100 });
  }

  static week(): number {
    return 7;
  }

  static month(): number {
    return 30;
  }
}
