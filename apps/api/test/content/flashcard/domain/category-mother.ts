import { Category, CategoryValue } from '@/content/flashcard/domain/category';
import { LearningModule } from '@/shared/domain/learning-module';

export class CategoryMother {
  static create(value: string): Category {
    return new Category(value);
  }

  static random(): Category {
    const values = Object.values(LearningModule);
    const value =
      values[Math.floor(Math.random() * values.length)] ??
      LearningModule.NativeSounds;
    return this.create(value);
  }

  static nativeSounds(): Category {
    return this.create(CategoryValue.NativeSounds);
  }

  static connectedSpeech(): Category {
    return this.create(CategoryValue.ConnectedSpeech);
  }
}
