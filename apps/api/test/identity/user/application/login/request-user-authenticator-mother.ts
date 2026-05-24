import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { EmailMother } from '@test/identity/user/domain/email-mother';

type RequestUserAuthenticator = {
  email: string;
  password: string;
  deviceId: string;
  fingerprint: string;
  ip: string;
};

export class RequestUserAuthenticatorMother {
  static random(
    overrides?: Partial<RequestUserAuthenticator>,
  ): RequestUserAuthenticator {
    return {
      email: overrides?.email ?? EmailMother.random().value,
      password: overrides?.password ?? StringMother.ofLength(12) + 'Aa1!',
      deviceId: overrides?.deviceId ?? UuidMother.random(),
      fingerprint: overrides?.fingerprint ?? UuidMother.random(),
      ip: overrides?.ip ?? StringMother.ip(),
    };
  }
}
