import { UserSession } from '@/identity/session/domain/user-session';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export class UserSessionMother {
  static create(
    overrides?: Partial<{
      id: string;
      tokenId: string;
      ownerId: string;
      deviceId: string;
      fingerprint: string;
    }>,
  ): UserSession {
    return UserSession.create(
      overrides?.id ?? UuidMother.random(),
      overrides?.tokenId ?? UuidMother.random(),
      overrides?.ownerId ?? UuidMother.random(),
      overrides?.deviceId ?? UuidMother.random(),
      overrides?.fingerprint ?? 'dXNlci1hZ2VudHwqfDEyNy4wLjAuMQ==',
    );
  }

  static createGuest(
    overrides?: Partial<{
      id: string;
      tokenId: string;
      deviceId: string;
      fingerprint: string;
    }>,
  ): UserSession {
    const deviceId = overrides?.deviceId ?? UuidMother.random();
    return UserSession.createGuest(
      overrides?.id ?? UuidMother.random(),
      overrides?.tokenId ?? UuidMother.random(),
      deviceId,
      overrides?.fingerprint ?? 'dXNlci1hZ2VudHwqfDEyNy4wLjAuMQ==',
    );
  }

  static expired(
    overrides?: Partial<{
      tokenId: string;
      ownerId: string;
      deviceId: string;
    }>,
  ): UserSession {
    const p = this.create(overrides).toPrimitives();
    const past = new Date();
    past.setDate(past.getDate() - 1);
    return UserSession.fromPrimitives({ ...p, expiresAt: past });
  }

  static revoked(
    overrides?: Partial<{
      tokenId: string;
      ownerId: string;
      deviceId: string;
    }>,
  ): UserSession {
    return this.create(overrides).revoke();
  }

  static revokedGuest(
    overrides?: Partial<{
      tokenId: string;
      deviceId: string;
    }>,
  ): UserSession {
    return this.createGuest(overrides).revoke();
  }
}
