import { User } from '@/identity/user/domain/user';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { EmailMother } from '@test/identity/user/domain/email-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';
import { DateMother } from '@test/shared/domain/date-mother';

export class UserMother {
  /**
   * Creates a persisted user (no pending domain events).
   * Use this when you need an existing user fetched from the repository.
   */
  static random(
    overrides?: Partial<{
      id: string;
      email: string;
      nickname: string;
      avatarUrl: string | null;
      currentStreak: number;
      longestStreak: number;
      lastActivityDate: Date | null;
      showInRanking: boolean;
    }>,
  ): User {
    const now = DateMother.recent();
    return User.fromPrimitives({
      id: overrides?.id ?? UserIdMother.random().value,
      email: overrides?.email ?? EmailMother.random().value,
      passwordHash: null,
      nickname: overrides?.nickname ?? NicknameMother.random().value,
      avatarUrl: overrides?.avatarUrl ?? null,
      role: 'user',
      oauthProvider: null,
      showInRanking: overrides?.showInRanking ?? true,
      currentStreak: overrides?.currentStreak ?? 0,
      longestStreak: overrides?.longestStreak ?? overrides?.currentStreak ?? 0,
      lastActivityDate: overrides?.lastActivityDate ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Creates a persisted user with a hashed password.
   */
  static randomWithPassword(email?: string): User {
    const now = DateMother.recent();
    return User.fromPrimitives({
      id: UserIdMother.random().value,
      email: email ?? EmailMother.random().value,
      passwordHash: 'hashed-password',
      nickname: NicknameMother.random().value,
      avatarUrl: null,
      role: 'user',
      oauthProvider: null,
      showInRanking: true,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      createdAt: now,
      updatedAt: now,
    });
  }
}
