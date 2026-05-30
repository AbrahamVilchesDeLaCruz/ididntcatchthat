import { type RequestGuestAuthenticator } from '@/identity/session/application/authenticate/guest-authenticator';
import { StringMother } from '@test/shared/domain/string-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export type { RequestGuestAuthenticator };

export class RequestGuestAuthenticatorMother {
  static random(
    overrides?: Partial<RequestGuestAuthenticator>,
  ): RequestGuestAuthenticator {
    return {
      fingerprint: UuidMother.random(),
      ip: StringMother.ip(),
      ...overrides,
    };
  }
}
