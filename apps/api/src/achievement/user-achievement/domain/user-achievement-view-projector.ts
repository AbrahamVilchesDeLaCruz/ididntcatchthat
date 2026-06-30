import { Injectable } from '@nestjs/common';
import { type AchievementDefinition } from '@/achievement/catalog/domain/achievement-definition';
import { type UserAchievement } from '@/achievement/user-achievement/domain/user-achievement';
import { AchievementUserViewEntry } from '@/achievement/user-achievement/domain/achievement-user-view-entry';

export type UserAchievementViewOptions = {
  since?: Date | null;
};

@Injectable()
export class UserAchievementViewProjector {
  project(
    unlockedAchievements: UserAchievement[],
    catalog: AchievementDefinition[],
    options: UserAchievementViewOptions = {},
  ): AchievementUserViewEntry[] {
    const unlockedByKey = this.indexUnlockedByKey(unlockedAchievements);
    const sinceDate = options.since ?? null;

    return catalog
      .map((definition) =>
        AchievementUserViewEntry.create(
          definition,
          unlockedByKey.get(definition.toPrimitives().key) ?? null,
        ),
      )
      .filter((entry) => entry.isVisibleSince(sinceDate));
  }

  private indexUnlockedByKey(
    achievements: UserAchievement[],
  ): Map<string, UserAchievement> {
    return new Map(
      achievements.map((achievement) => {
        const { achievementKey } = achievement.toPrimitives();
        return [achievementKey, achievement] as const;
      }),
    );
  }
}
