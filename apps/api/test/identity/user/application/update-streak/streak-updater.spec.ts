import { mock } from 'jest-mock-extended';
import { StreakUpdater } from '@/identity/user/application/update-streak/streak-updater';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type Logger } from '@/shared/domain/logger';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';
import { StreakUpdatedEvent } from '@/identity/user/domain/events/streak-updated.event';
import { UserMother } from '@test/identity/user/domain/user-mother';
import { RequestStreakUpdaterMother } from './request-streak-updater-mother';

describe('identity/user/application/update-streak StreakUpdater', () => {
  const userRepository = mock<UserRepository>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let updater: StreakUpdater;

  beforeEach(() => {
    userRepository.search.mockReset();
    userRepository.save.mockReset();
    publisher.publish.mockReset();
    publisher.publish.mockResolvedValue(undefined);
    updater = new StreakUpdater(userRepository, publisher, logger);
  });

  it('should increment streak on consecutive days and publish StreakUpdated', async () => {
    const user = UserMother.random({
      currentStreak: 2,
      longestStreak: 2,
      lastActivityDate: new Date('2026-06-18'),
    });
    userRepository.search.mockResolvedValue(user);

    await updater.execute(
      RequestStreakUpdaterMother.random({
        userId: user.id.value,
        activityDate: '2026-06-19T12:00:00.000Z',
      }),
    );

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const saved = userRepository.save.mock.calls[0][0];
    expect(saved.currentStreak).toBe(3);
    const events = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(StreakUpdatedEvent);
    expect(logger.info).toHaveBeenCalled();
  });

  it('should not save or publish when activity is on the same day', async () => {
    const day = new Date('2026-06-19');
    const user = UserMother.random({
      currentStreak: 4,
      longestStreak: 4,
      lastActivityDate: day,
    });
    userRepository.search.mockResolvedValue(user);

    await updater.execute(
      RequestStreakUpdaterMother.random({
        userId: user.id.value,
        activityDate: '2026-06-19T18:00:00.000Z',
      }),
    );

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should reset streak after a gap in activity', async () => {
    const user = UserMother.random({
      currentStreak: 5,
      longestStreak: 5,
      lastActivityDate: new Date('2026-06-10'),
    });
    userRepository.search.mockResolvedValue(user);

    await updater.execute(
      RequestStreakUpdaterMother.random({
        userId: user.id.value,
        activityDate: '2026-06-19T12:00:00.000Z',
      }),
    );

    const saved = userRepository.save.mock.calls[0][0];
    expect(saved.currentStreak).toBe(1);
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.search.mockResolvedValue(null);

    await expect(
      updater.execute(RequestStreakUpdaterMother.random()),
    ).rejects.toThrow(UserNotFoundException);
  });
});
