import { StringMother } from '@test/shared/domain/string-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

type GuestAuthenticatorParams = {
  fingerprint: string;
  ip: string;
};

export class GuestAuthenticatorParamsMother {
  static random(
    overrides?: Partial<GuestAuthenticatorParams>,
  ): GuestAuthenticatorParams {
    return {
      fingerprint: overrides?.fingerprint ?? UuidMother.random(),
      ip: overrides?.ip ?? StringMother.ip(),
    };
  }
}
