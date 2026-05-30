import { type RequestTokenRefresher } from '@/identity/session/application/refresh/token-refresher';
import { StringMother } from '@test/shared/domain/string-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export type { RequestTokenRefresher };

export class RequestTokenRefresherMother {
  static random(
    overrides?: Partial<RequestTokenRefresher>,
  ): RequestTokenRefresher {
    return {
      tokenId: UuidMother.random(),
      deviceId: UuidMother.random(),
      fingerprint: UuidMother.random(),
      ip: StringMother.ip(),
      ...overrides,
    };
  }
}
