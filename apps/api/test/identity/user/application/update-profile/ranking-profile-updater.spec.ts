import { mock } from 'jest-mock-extended';
import { RankingProfileUpdater } from '@/identity/user/application/update-profile/ranking-profile-updater';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type Logger } from '@/shared/domain/logger';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';
import { RankingProfileUpdatedEvent } from '@/identity/user/domain/events/ranking-profile-updated.event';
import { UserMother } from '@test/identity/user/domain/user-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { RequestRankingProfileUpdaterMother } from './request-ranking-profile-updater-mother';

describe('identity/user/application/update-profile RankingProfileUpdater', () => {
  const userRepository = mock<UserRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let updater: RankingProfileUpdater;

  beforeEach(() => {
    userRepository.search.mockReset();
    userRepository.save.mockReset();
    publisher.publish.mockReset();
    userRepository.save.mockResolvedValue(undefined);
    publisher.publish.mockResolvedValue(undefined);
    updater = new RankingProfileUpdater(userRepository, publisher, logger);
  });

  it('should update ranking preferences, publish event and return view model', async () => {
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
    const events = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(RankingProfileUpdatedEvent);
    expect(logger.info).toHaveBeenCalled();
  });

  it('should not save or publish when preferences are unchanged', async () => {
    const nickname = NicknameMother.random().value;
    const user = UserMother.random({ showInRanking: true, nickname });

    userRepository.search.mockResolvedValue(user);

    const result = await updater.execute(
      RequestRankingProfileUpdaterMother.random({
        userId: user.id.value,
        showInRanking: true,
        nickname,
      }),
    );

    expect(result).toEqual({ showInRanking: true, nickname });
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.search.mockResolvedValue(null);

    await expect(
      updater.execute(RequestRankingProfileUpdaterMother.random()),
    ).rejects.toThrow(UserNotFoundException);
  });
});
