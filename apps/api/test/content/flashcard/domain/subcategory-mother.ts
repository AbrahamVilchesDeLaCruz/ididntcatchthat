import { Subcategory } from '@/content/flashcard/domain/subcategory';
import { Category, CategoryValue } from '@/content/flashcard/domain/category';
import { MasteringSoundsSubcategory } from '@/content/flashcard/domain/subcategory-enums';

export class SubcategoryMother {
  static forCategory(category: Category): Subcategory {
    // Pick first valid subcategory for the given category
    const categorySubcategoryMap: Record<CategoryValue, string> = {
      [CategoryValue.MasteringSounds]:
        MasteringSoundsSubcategory.FLAP_T_PARTY_CITY,
      [CategoryValue.ConnectingWordsInSpeech]: 'FLAP_T_THAT_APPLE',
      [CategoryValue.BeautifyingSentences]: 'CONTRAST',
      [CategoryValue.SoundingNative]: 'DEAL_AND_OTHER_EXPRESSIONS',
    };
    return Subcategory.create(
      categorySubcategoryMap[category.value as CategoryValue],
      category,
    );
  }

  static masteringSounds(): Subcategory {
    return Subcategory.create(
      MasteringSoundsSubcategory.FLAP_T_PARTY_CITY,
      new Category(CategoryValue.MasteringSounds),
    );
  }
}
