import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

@Injectable()
export class StreakBrokenCronJob {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const staleUsers = await this.userRepository.findWithStaleStreak(yesterday);

    for (const user of staleUsers) {
      const broken = user.breakStreak(new Date());
      await this.userRepository.save(broken);
      await this.publisher.publish(broken.pullDomainEvents());
    }

    if (staleUsers.length > 0) {
      this.logger.info('Broken stale streaks', { count: staleUsers.length });
    }
  }
}
