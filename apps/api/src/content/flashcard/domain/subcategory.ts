import { StringValueObject } from '@/shared/domain/string-value-object';
import { type Category } from './category';
import { InvalidSubcategory } from './exceptions/invalid-subcategory';
import { SUBCATEGORY_BY_CATEGORY } from './subcategory-catalog';

export class Subcategory extends StringValueObject {
  constructor(value: string, category: Category) {
    super(value);
    this.ensureSubcategoryIsValid(value, category);
  }

  private ensureSubcategoryIsValid(value: string, category: Category): void {
    const valid = SUBCATEGORY_BY_CATEGORY[category.module];
    if (!valid?.has(value)) {
      throw new InvalidSubcategory();
    }
  }
}
