import { mock } from 'jest-mock-extended';
import { RankingProfileUpdater } from '@/identity/user/application/update-profile/ranking-profile-updater';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';
import { UserMother } from '@test/identity/user/domain/user-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { RequestRankingProfileUpdaterMother } from './request-ranking-profile-updater-mother';

describe('identity/user/application/update-profile RankingProfileUpdater', () => {
  const userRepository = mock<UserRepository>();
  let updater: RankingProfileUpdater;

  beforeEach(() => {
    userRepository.search.mockReset();
    userRepository.save.mockReset();
    userRepository.save.mockResolvedValue(undefined);
    updater = new RankingProfileUpdater(userRepository);
  });

  it('should update ranking preferences and return view model', async () => {
    const user = UserMother.random({ showInRanking: false });
    userRepository.search.mockResolvedValue(user);
    const nickname = NicknameMother.random().value;

    const result = await updater.execute(
      RequestRankingProfileUpdaterMother.random({
        userId: user.id.value,
        showInRanking: true,
        nickname,
      }),
    );

    expect(result).toEqual({
      showInRanking: true,
      nickname,
    });
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.search.mockResolvedValue(null);

    await expect(
      updater.execute(RequestRankingProfileUpdaterMother.random()),
    ).rejects.toThrow(UserNotFoundException);
  });
});
