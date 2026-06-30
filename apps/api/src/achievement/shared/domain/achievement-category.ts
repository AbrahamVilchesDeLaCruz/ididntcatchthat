import { StringValueObject } from '@/shared/domain/string-value-object';
import { AchievementCategoryInvalid } from '@/achievement/shared/domain/exceptions/achievement-category-invalid';

const VALID_CATEGORIES = ['game', 'streak', 'module', 'study'] as const;

export type AchievementCategoryValue = (typeof VALID_CATEGORIES)[number];

export class AchievementCategory extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (!VALID_CATEGORIES.includes(value as AchievementCategoryValue)) {
      throw new AchievementCategoryInvalid(value);
    }
  }

  static create(value: string): AchievementCategory {
    return new AchievementCategory(value);
  }
}
