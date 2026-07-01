import { Inject, Injectable } from '@nestjs/common';
import { UserId } from '@/shared/domain/user-id';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestGuestProgressMigrator } from './request-guest-progress-migrator';

export type { RequestGuestProgressMigrator };

@Injectable()
export class GuestProgressMigrator {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestGuestProgressMigrator): Promise<void> {
    const { userId, deviceId, guestDeviceId, guestGames } = request;

    if (guestGames.length === 0) return;

    const user = await this.userRepository.search(new UserId(userId));
    if (!user) throw new UserNotFoundException(userId);

    const gameIds = guestGames.map((g) => g.gameId);
    const updated = user.requestGuestProgressMigration(
      deviceId,
      guestDeviceId,
      gameIds,
    );

    await this.userRepository.save(updated);
    await this.publisher.publish(updated.pullDomainEvents());

    this.logger.info('Guest progress migration requested', {
      userId,
      gamesCount: guestGames.length,
      guestDeviceId,
    });
  }
}
