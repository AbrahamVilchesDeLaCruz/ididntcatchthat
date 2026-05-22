import { User } from '@/identity/domain/user';
import { UserRole } from '@/identity/domain/user-role';
import { UserIdMother } from '@test/identity/domain/user-id-mother';
import { EmailMother } from '@test/identity/domain/email-mother';
import { NicknameMother } from '@test/identity/domain/nickname-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export class UserMother {
  static random(
    overrides?: Partial<{
      id: string;
      email: string;
      nickname: string;
      deviceId: string;
    }>,
  ): User {
    return User.register({
      id: overrides?.id
        ? UserIdMother.withValue(overrides.id)
        : UserIdMother.random(),
      email: overrides?.email
        ? EmailMother.withValue(overrides.email)
        : EmailMother.random(),
      passwordHash: null,
      nickname: overrides?.nickname
        ? NicknameMother.withValue(overrides.nickname)
        : NicknameMother.random(),
      avatarUrl: null,
      role: UserRole.create('user'),
      oauthProvider: null,
      deviceId: overrides?.deviceId ?? UuidMother.random(),
    });
  }
}
