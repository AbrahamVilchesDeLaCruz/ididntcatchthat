import { mock } from 'jest-mock-extended';
import { RankingProfileFinder } from '@/identity/user/application/update-profile/ranking-profile-finder';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';
import { UserMother } from '@test/identity/user/domain/user-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('identity/user/application/update-profile RankingProfileFinder', () => {
  const userRepository = mock<UserRepository>();
  let finder: RankingProfileFinder;

  beforeEach(() => {
    userRepository.search.mockReset();
    finder = new RankingProfileFinder(userRepository);
  });

  it('should return ranking profile for existing user', async () => {
    const user = UserMother.random({
      showInRanking: true,
      nickname: 'hero',
    });
    userRepository.search.mockResolvedValue(user);

    const result = await finder.execute(user.id.value);

    expect(result).toEqual({
      showInRanking: true,
      nickname: user.nickname.value,
    });
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.search.mockResolvedValue(null);

    await expect(finder.execute(UuidMother.random())).rejects.toThrow(
      UserNotFoundException,
    );
  });
});
