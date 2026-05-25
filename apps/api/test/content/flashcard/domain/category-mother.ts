import { Category, CategoryValue } from '@/content/flashcard/domain/category';

export class CategoryMother {
  static create(value: string): Category {
    return new Category(value);
  }
  static random(): Category {
    const values = Object.values(CategoryValue);
    const value = values[Math.floor(Math.random() * values.length)];
    return this.create(value);
  }

  static masteringSounds(): Category {
    return this.create(CategoryValue.MasteringSounds);
  }

  static connectingWordsInSpeech(): Category {
    return this.create(CategoryValue.ConnectingWordsInSpeech);
  }
}
