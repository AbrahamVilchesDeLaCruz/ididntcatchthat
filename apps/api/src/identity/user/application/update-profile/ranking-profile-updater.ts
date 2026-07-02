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

export type RequestRankingProfileUpdater = {
  userId: string;
  showInRanking: boolean;
  nickname: string;
};

export type RankingProfileViewModel = {
  showInRanking: boolean;
  nickname: string;
};

@Injectable()
export class RankingProfileUpdater {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
  ) {}

  async execute(
    request: RequestRankingProfileUpdater,
  ): Promise<RankingProfileViewModel> {
    const user = await this.userRepository.search(new UserId(request.userId));
    if (!user) throw new UserNotFoundException(request.userId);

    const updated = user.updateRankingPreferences(
      request.showInRanking,
      request.nickname,
    );

    if (updated === user) {
      return {
        showInRanking: user.showInRanking,
        nickname: user.nickname.value,
      };
    }

    await this.userRepository.save(updated);
    await this.publisher.publish(updated.pullDomainEvents());

    this.logger.info('Ranking profile updated', {
      userId: request.userId,
      showInRanking: updated.showInRanking,
    });

    return {
      showInRanking: updated.showInRanking,
      nickname: updated.nickname.value,
    };
  }
}
