import { EmailMother } from '@test/identity/domain/email-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

type OAuthParams = {
  id: string;
  email: string;
  avatarUrl: string | null;
  displayName: string;
  deviceId: string;
  fingerprint: string;
  ip: string;
};
export class OAuthAuthenticatorParamsMother {
  static random(overrides: Partial<OAuthParams> = {}): OAuthParams {
    return {
      id: UuidMother.random(),
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
