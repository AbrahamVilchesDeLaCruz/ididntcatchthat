import { type RequestSessionRevoker } from '@/identity/session/application/logout/session-revoker';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export type { RequestSessionRevoker };

export class RequestSessionRevokerMother {
  static random(
    overrides?: Partial<RequestSessionRevoker>,
  ): RequestSessionRevoker {
    return {
      tokenId: UuidMother.random(),
      ...overrides,
    };
  }
}
