import { Subcategory } from '@/content/flashcard/domain/subcategory';
import { Category, CategoryValue } from '@/content/flashcard/domain/category';
import {
  ConnectedSpeechSubcategory,
  FlowConnectorsSubcategory,
  NativeSoundsSubcategory,
  RealTalkSubcategory,
} from '@/content/flashcard/domain/subcategory-catalog';
import { LearningModule } from '@/shared/domain/learning-module';

export class SubcategoryMother {
  static forCategory(category: Category): Subcategory {
    const categorySubcategoryMap: Record<LearningModule, string> = {
      [LearningModule.NativeSounds]: NativeSoundsSubcategory.VVacation,
      [LearningModule.ConnectedSpeech]:
        ConnectedSpeechSubcategory.InformalGoingTo,
      [LearningModule.FlowConnectors]: FlowConnectorsSubcategory.Contrast,
      [LearningModule.RealTalk]: RealTalkSubcategory.CasualResponses,
    };
    return new Subcategory(categorySubcategoryMap[category.module], category);
  }

  static nativeSounds(): Subcategory {
    return new Subcategory(
      NativeSoundsSubcategory.VVacation,
      new Category(CategoryValue.NativeSounds),
    );
  }
}
