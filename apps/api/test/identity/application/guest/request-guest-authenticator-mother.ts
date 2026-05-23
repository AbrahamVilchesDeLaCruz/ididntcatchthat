import { StringMother } from '@test/shared/domain/string-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

type RequestGuestAuthenticator = {
  fingerprint: string;
  ip: string;
};

export class RequestGuestAuthenticatorMother {
  static random(
    overrides?: Partial<RequestGuestAuthenticator>,
  ): RequestGuestAuthenticator {
    return {
      fingerprint: overrides?.fingerprint ?? UuidMother.random(),
      ip: overrides?.ip ?? StringMother.ip(),
    };
  }
}
