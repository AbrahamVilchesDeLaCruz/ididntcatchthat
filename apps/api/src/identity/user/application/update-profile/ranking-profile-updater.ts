import { Inject, Injectable } from '@nestjs/common';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
import { UserId } from '@/shared/domain/user-id';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';

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
    await this.userRepository.save(updated);

    return {
      showInRanking: updated.showInRanking,
      nickname: updated.nickname.value,
    };
  }
}
