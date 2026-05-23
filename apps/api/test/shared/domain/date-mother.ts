import { MotherCreator } from './mother-creator';

export class DateMother {
  static recent(): Date {
    return MotherCreator.random().date.recent();
  }

  static past(): Date {
    return MotherCreator.random().date.past();
  }

  static future(): Date {
    return MotherCreator.random().date.future();
  }
}
