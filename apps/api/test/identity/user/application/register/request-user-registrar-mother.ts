import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { EmailMother } from '@test/identity/user/domain/email-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';

type RequestUserRegistrar = {
  id: string;
  email: string;
  password: string;
  nickname: string;
  deviceId: string;
  fingerprint: string;
  ip: string;
};

export class RequestUserRegistrarMother {
  static random(
    overrides?: Partial<RequestUserRegistrar>,
  ): RequestUserRegistrar {
    return {
      id: overrides?.id ?? UuidMother.random(),
      email: overrides?.email ?? EmailMother.random().value,
      password: overrides?.password ?? StringMother.ofLength(12) + 'Aa1!',
      nickname: overrides?.nickname ?? NicknameMother.random().value,
      deviceId: overrides?.deviceId ?? UuidMother.random(),
      fingerprint: overrides?.fingerprint ?? UuidMother.random(),
      ip: overrides?.ip ?? StringMother.ip(),
    };
  }
}
