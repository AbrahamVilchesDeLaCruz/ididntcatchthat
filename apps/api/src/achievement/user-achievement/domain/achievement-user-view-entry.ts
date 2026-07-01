import { type AchievementDefinition } from '@/achievement/catalog/domain/achievement-definition';
import { type UserAchievement } from '@/achievement/user-achievement/domain/user-achievement';

export class AchievementUserViewEntry {
  private constructor(
    readonly definition: AchievementDefinition,
    readonly userAchievement: UserAchievement | null,
  ) {}

  static create(
    definition: AchievementDefinition,
    userAchievement: UserAchievement | null,
  ): AchievementUserViewEntry {
    return new AchievementUserViewEntry(definition, userAchievement);
  }

  isVisibleSince(sinceDate: Date | null): boolean {
    if (!sinceDate) return true;
    if (!this.userAchievement) return false;

    return this.userAchievement.toPrimitives().unlockedAt >= sinceDate;
  }
}
