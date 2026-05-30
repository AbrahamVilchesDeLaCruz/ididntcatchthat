import { type RequestOAuthAuthenticator } from '@/identity/user/application/authenticate/oauth-authenticator';
import { EmailMother } from '@test/identity/user/domain/email-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export type { RequestOAuthAuthenticator };

export class RequestOAuthAuthenticatorMother {
  static random(
    overrides?: Partial<RequestOAuthAuthenticator>,
  ): RequestOAuthAuthenticator {
    return {
      email: EmailMother.random().value,
      avatarUrl: null,
      displayName: 'Test User',
      deviceId: UuidMother.random(),
      fingerprint: UuidMother.random(),
      ip: StringMother.ip(),
      ...overrides,
    };
  }
}
