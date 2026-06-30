import { Inject, Injectable } from '@nestjs/common';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { UserId } from '@/shared/domain/user-id';
import { type AchievementKey } from '@/achievement/shared/domain/achievement-key';
import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { UserAchievement } from '@/achievement/user-achievement/domain/user-achievement';
import {
  type UserAchievementRepository,
  USER_ACHIEVEMENT_REPOSITORY,
} from '@/achievement/user-achievement/domain/user-achievement.repository';

@Injectable()
export class UserAchievementUnlocker {
  constructor(
    @Inject(USER_ACHIEVEMENT_REPOSITORY)
    private readonly repository: UserAchievementRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
    private readonly catalog: AchievementCatalog,
  ) {}

  async unlock(userId: string, key: AchievementKey): Promise<void> {
    const id = new UserId(userId);
    const existing = await this.repository.search(id, key);
    if (existing) {
      return;
    }

    const definition = this.catalog.get(key);
    const achievement = UserAchievement.unlock(id, key, definition.category);
    await this.repository.save(achievement);
    await this.publisher.publish(achievement.pullDomainEvents());

    this.logger.info('Achievement unlocked', {
      userId,
      achievementKey: key.value,
      category: definition.category.value,
    });
  }
}
