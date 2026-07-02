import { MotherCreator } from '@test/shared/domain/mother-creator';

export class ModuleMasteryLevelMother {
  static random(): number {
    return MotherCreator.random().number.int({ min: 1, max: 5 });
  }

  static beginner(): number {
    return 1;
  }

  static intermediate(): number {
    return 2;
  }
}
