import { MotherCreator } from './mother-creator';

export class BooleanMother {
  static random(): boolean {
    return MotherCreator.random().datatype.boolean();
  }
}
