import { type AchievementUserViewEntry } from '@/achievement/user-achievement/domain/achievement-user-view-entry';
import { type AchievementDefinition } from '@/achievement/catalog/domain/achievement-definition';
import { type UserAchievement } from '@/achievement/user-achievement/domain/user-achievement';

export type ResponseAchievementsSearcherItemPrimitives = {
  key: string;
  category: 'game' | 'streak' | 'module' | 'study';
  sortOrder: number;
  unlockedAt: string | null;
};

export class ResponseAchievementsSearcherItem {
  constructor(
    private readonly definition: AchievementDefinition,
    private readonly userAchievement: UserAchievement | null,
  ) {}

  static fromViewEntry(
    entry: AchievementUserViewEntry,
  ): ResponseAchievementsSearcherItem {
    return new ResponseAchievementsSearcherItem(
      entry.definition,
      entry.userAchievement,
    );
  }

  toResponse(): ResponseAchievementsSearcherItemPrimitives {
    const definition = this.definition.toPrimitives();
    const unlockedAt = this.userAchievement
      ? this.userAchievement.toPrimitives().unlockedAt.toISOString()
      : null;

    return {
      key: definition.key,
      category: definition.category,
      sortOrder: definition.sortOrder,
      unlockedAt,
    };
  }
}
