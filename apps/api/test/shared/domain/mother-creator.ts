import { faker, type Faker } from '@faker-js/faker';

/**
 * Único punto de entrada a faker en toda la jerarquía de Mothers.
 * Si se cambia la librería de datos de prueba, solo cambia este archivo.
 */
export class MotherCreator {
  static random(): Faker {
    return faker;
  }
}
