import { User } from '@/identity/user/domain/user';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { EmailMother } from '@test/identity/user/domain/email-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { StreakUpdatedEvent } from '@/identity/user/domain/events/streak-updated.event';

describe('identity/user/domain User streak', () => {
  const makeUser = (overrides?: {
    currentStreak?: number;
    lastActivityDate?: Date | null;
  }): User => {
    const now = new Date();
    return User.fromPrimitives({
      id: UuidMother.random(),
      email: EmailMother.random().value,
      passwordHash: null,
      nickname: NicknameMother.random().value,
      avatarUrl: null,
      role: 'user',
      oauthProvider: null,
      showInRanking: true,
      currentStreak: overrides?.currentStreak ?? 0,
      longestStreak: overrides?.currentStreak ?? 0,
      lastActivityDate: overrides?.lastActivityDate ?? null,
      createdAt: now,
      updatedAt: now,
    });
  };

  it('should increment streak on consecutive days', () => {
    const user = makeUser({
      currentStreak: 2,
      lastActivityDate: new Date('2026-06-18'),
    });

    const updated = user.recordDailyActivity(new Date('2026-06-19'));
    expect(updated.currentStreak).toBe(3);
    expect(updated.pullDomainEvents()[0]).toBeInstanceOf(StreakUpdatedEvent);
  });

  it('should not change streak on same day', () => {
    const day = new Date('2026-06-19');
    const user = makeUser({
      currentStreak: 4,
      lastActivityDate: day,
    });

    const updated = user.recordDailyActivity(new Date('2026-06-19T18:00:00Z'));
    expect(updated).toBe(user);
  });

  it('should reset streak after a gap', () => {
    const user = makeUser({
      currentStreak: 5,
      lastActivityDate: new Date('2026-06-10'),
    });

    const updated = user.recordDailyActivity(new Date('2026-06-19'));
    expect(updated.currentStreak).toBe(1);
  });
});
