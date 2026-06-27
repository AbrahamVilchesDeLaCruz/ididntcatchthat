import { Inject, Injectable } from '@nestjs/common';
import {
  type UserAchievementRepository,
  USER_ACHIEVEMENT_REPOSITORY,
} from '@/achievement/domain/user-achievement.repository';
import { UserAchievement } from '@/achievement/domain/user-achievement';
import { UserId } from '@/shared/domain/user-id';

@Injectable()
export class AchievementUnlocker {
  constructor(
    @Inject(USER_ACHIEVEMENT_REPOSITORY)
    private readonly repository: UserAchievementRepository,
  ) {}

  async unlock(userId: string, achievementKey: string): Promise<boolean> {
    const id = new UserId(userId);
    const existing = await this.repository.findByUserId(id);
    if (existing.some((a) => a.achievementKey === achievementKey)) {
      return false;
    }

    await this.repository.save(UserAchievement.unlock(id, achievementKey));
    return true;
  }
}
