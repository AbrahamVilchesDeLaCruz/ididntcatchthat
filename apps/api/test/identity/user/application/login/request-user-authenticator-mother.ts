import { type RequestUserAuthenticator } from '@/identity/user/application/login/user-authenticator';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { EmailMother } from '@test/identity/user/domain/email-mother';

export type { RequestUserAuthenticator };

export class RequestUserAuthenticatorMother {
  static random(
    overrides?: Partial<RequestUserAuthenticator>,
  ): RequestUserAuthenticator {
    return {
      email: EmailMother.random().value,
      password: StringMother.ofLength(12) + 'Aa1!',
      deviceId: UuidMother.random(),
      fingerprint: UuidMother.random(),
      ip: StringMother.ip(),
      ...overrides,
    };
  }
}
