import { Inject, Injectable } from '@nestjs/common';
import {
  type UserAchievementRepository,
  USER_ACHIEVEMENT_REPOSITORY,
} from '@/achievement/domain/user-achievement.repository';
import { UserAchievement } from '@/achievement/domain/user-achievement';
import { UserId } from '@/shared/domain/user-id';
import { getAchievementCategory } from '@/achievement/domain/achievement-catalog';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { AchievementUnlockedEvent } from '@/achievement/domain/events/achievement-unlocked.event';

@Injectable()
export class AchievementUnlocker {
  constructor(
    @Inject(USER_ACHIEVEMENT_REPOSITORY)
    private readonly repository: UserAchievementRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {}

  async unlock(userId: string, achievementKey: string): Promise<boolean> {
    const id = new UserId(userId);
    if (await this.repository.exists(id, achievementKey)) {
      return false;
    }

    const achievement = UserAchievement.unlock(id, achievementKey);
    await this.repository.save(achievement);

    const unlockedAt = achievement.unlockedAt.toISOString();
    await this.publisher.publish([
      new AchievementUnlockedEvent(`${userId}:${achievementKey}`, {
        userId,
        achievementKey,
        category: getAchievementCategory(achievementKey),
        unlockedAt,
      }),
    ]);

    return true;
  }
}
