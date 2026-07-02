import { Inject, Injectable } from '@nestjs/common';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { UserId } from '@/shared/domain/user-id';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

export type RequestStreakUpdater = {
  userId: string;
  activityDate: string;
};

@Injectable()
export class StreakUpdater {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
  ) {}

  async execute({ userId, activityDate }: RequestStreakUpdater): Promise<void> {
    const user = await this.userRepository.search(new UserId(userId));
    if (!user) throw new UserNotFoundException(userId);

    const updated = user.recordDailyActivity(new Date(activityDate));
    if (updated === user) return;

    await this.userRepository.save(updated);
    await this.publisher.publish(updated.pullDomainEvents());

    this.logger.info('User streak updated', {
      userId,
      currentStreak: updated.currentStreak,
    });
  }
}
