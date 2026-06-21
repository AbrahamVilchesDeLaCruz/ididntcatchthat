import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { UserEntity } from '@/identity/user/infrastructure/persistence/user.entity';
import { User } from '@/identity/user/domain/user';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

@Injectable()
export class StreakBrokenCronJob {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().slice(0, 10);

    const staleUsers = await this.userRepo
      .createQueryBuilder('u')
      .where('u.current_streak > 0')
      .andWhere('u.last_activity_date IS NOT NULL')
      .andWhere('u.last_activity_date < :yesterday', {
        yesterday: yesterdayDate,
      })
      .getMany();

    for (const entity of staleUsers) {
      const user = User.fromPrimitives({
        id: entity.id,
        email: entity.email,
        passwordHash: entity.passwordHash,
        nickname: entity.nickname,
        avatarUrl: entity.avatarUrl,
        role: entity.role,
        oauthProvider: entity.oauthProvider,
        showInRanking: entity.showInRanking,
        currentStreak: entity.currentStreak,
        longestStreak: entity.longestStreak,
        lastActivityDate: entity.lastActivityDate,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });

      const broken = user.breakStreak(new Date());
      await this.userRepository.save(broken);
      await this.publisher.publish(broken.pullDomainEvents());
    }

    if (staleUsers.length > 0) {
      this.logger.info('Broken stale streaks', { count: staleUsers.length });
    }
  }
}
