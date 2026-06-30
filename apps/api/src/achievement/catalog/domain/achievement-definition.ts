import { AchievementKey } from '@/achievement/shared/domain/achievement-key';
import {
  AchievementCategory,
  type AchievementCategoryValue,
} from '@/achievement/shared/domain/achievement-category';
import { type AchievementKeyLiteral } from '@/achievement/shared/domain/achievement-key-values';
import { type AchievementUnlockRule } from '@/achievement/catalog/domain/achievement-unlock-rule';

export type AchievementDefinitionPrimitives = {
  key: AchievementKeyLiteral;
  category: 'game' | 'streak' | 'module' | 'study';
  sortOrder: number;
  unlockRule: AchievementUnlockRule;
};

export class AchievementDefinition {
  constructor(
    readonly key: AchievementKey,
    readonly category: AchievementCategory,
    readonly sortOrder: number,
    readonly unlockRule: AchievementUnlockRule,
  ) {}

  static fromPrimitives(
    primitives: AchievementDefinitionPrimitives,
  ): AchievementDefinition {
    return new AchievementDefinition(
      AchievementKey.create(primitives.key),
      AchievementCategory.create(primitives.category),
      primitives.sortOrder,
      primitives.unlockRule,
    );
  }

  toPrimitives(): AchievementDefinitionPrimitives {
    return {
      key: this.key.value as AchievementKeyLiteral,
      category: this.category.value as AchievementCategoryValue,
      sortOrder: this.sortOrder,
      unlockRule: this.unlockRule,
    };
  }
}
