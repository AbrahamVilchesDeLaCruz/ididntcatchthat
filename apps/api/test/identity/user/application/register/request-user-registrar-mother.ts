import { type RequestUserRegistrar } from '@/identity/user/application/register/user-registrar';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { EmailMother } from '@test/identity/user/domain/email-mother';
import { NicknameMother } from '@test/identity/user/domain/nickname-mother';

export type { RequestUserRegistrar };

export class RequestUserRegistrarMother {
  static random(
    overrides?: Partial<RequestUserRegistrar>,
  ): RequestUserRegistrar {
    return {
      id: UuidMother.random(),
      email: EmailMother.random().value,
      password: StringMother.ofLength(12) + 'Aa1!',
      nickname: NicknameMother.random().value,
      deviceId: UuidMother.random(),
      fingerprint: UuidMother.random(),
      ip: StringMother.ip(),
      ...overrides,
    };
  }
}
