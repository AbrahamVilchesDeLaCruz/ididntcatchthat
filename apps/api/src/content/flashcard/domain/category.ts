import { StringValueObject } from '@/shared/domain/string-value-object';
import {
  LEARNING_MODULES,
  LearningModule,
} from '@/shared/domain/learning-module';
import { CategoryInvalid } from './exceptions/category-invalid';

export { LearningModule as CategoryValue };

export class Category extends StringValueObject {
  private static readonly VALID_VALUES = new Set<string>(LEARNING_MODULES);

  constructor(value: string) {
    super(value);
    this.ensureCategoryIsValid(value);
  }

  private ensureCategoryIsValid(value: string): void {
    if (!Category.VALID_VALUES.has(value)) throw new CategoryInvalid();
  }

  get module(): LearningModule {
    return this.value as LearningModule;
  }
}
