import { User } from '@/identity/domain/user';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { EmailMother } from '@test/identity/domain/email-mother';
import { NicknameMother } from '@test/identity/domain/nickname-mother';

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
    }>,
  ): User {
    const now = new Date();
    return User.fromPrimitives({
      id: overrides?.id ?? UuidMother.random(),
      email: overrides?.email ?? EmailMother.random().value,
      passwordHash: null,
      nickname: overrides?.nickname ?? NicknameMother.random().value,
      avatarUrl: overrides?.avatarUrl ?? null,
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

  /**
   * Creates a persisted user with a hashed password.
   */
  static randomWithPassword(email?: string): User {
    const now = new Date();
    return User.fromPrimitives({
      id: UuidMother.random(),
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
