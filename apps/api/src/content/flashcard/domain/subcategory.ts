import { StringValueObject } from '@/shared/domain/string-value-object';
import { type Category } from './category';
import { InvalidSubcategory } from './exceptions/invalid-subcategory';
import { SUBCATEGORY_BY_CATEGORY } from './subcategory-enums';

export class Subcategory extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string, category: Category): Subcategory {
    const valid =
      SUBCATEGORY_BY_CATEGORY[
        category.value as keyof typeof SUBCATEGORY_BY_CATEGORY
      ];
    if (!valid?.has(value)) {
      throw new InvalidSubcategory();
    }
    return new Subcategory(value);
  }
}
