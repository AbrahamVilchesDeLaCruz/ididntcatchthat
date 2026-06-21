import { Inject, Injectable } from '@nestjs/common';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
import { UserId } from '@/shared/domain/user-id';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';
import { type RankingProfileViewModel } from '@/identity/user/application/update-profile/ranking-profile-updater';

@Injectable()
export class RankingProfileFinder {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<RankingProfileViewModel> {
    const user = await this.userRepository.search(new UserId(userId));
    if (!user) throw new UserNotFoundException(userId);

    return {
      showInRanking: user.showInRanking,
      nickname: user.nickname.value,
    };
  }
}
