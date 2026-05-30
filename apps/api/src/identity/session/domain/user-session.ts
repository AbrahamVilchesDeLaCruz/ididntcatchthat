import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { SessionStartedEvent } from '@/identity/session/domain/events/session-started.event';
import { SessionRevokedEvent } from '@/identity/session/domain/events/session-revoked.event';
import { SessionRotatedEvent } from '@/identity/session/domain/events/session-rotated.event';

export enum OwnerType {
  User = 'user',
  Guest = 'guest',
}

export type UserSessionPrimitives = {
  id: string;
  tokenId: string;
  ownerId: string;
  ownerType: OwnerType;
  deviceId: string;
  fingerprint: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

export class UserSession extends AggregateRoot<UserSessionPrimitives> {
  private static readonly TTL_DAYS = 30;

  private constructor(
    readonly id: string,
    readonly tokenId: string,
    readonly ownerId: string,
    readonly ownerType: OwnerType,
    readonly deviceId: string,
    readonly fingerprint: string,
    readonly expiresAt: Date,
    readonly revokedAt: Date | null,
    readonly createdAt: Date,
  ) {
    super();
  }

  static create(
    id: string,
    tokenId: string,
    ownerId: string,
    deviceId: string,
    fingerprint: string,
  ): UserSession {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + UserSession.TTL_DAYS);

    const session = new UserSession(
      id,
      tokenId,
      ownerId,
      'user',
      deviceId,
      fingerprint,
      expiresAt,
      null,
      new Date(),
    );

    session.record(
      new SessionStartedEvent(id, {
        ownerId,
        ownerType: OwnerType.User,
        deviceId,
      }),
    );
    return session;
  }

  static createGuest(
    id: string,
    tokenId: string,
    deviceId: string,
    fingerprint: string,
  ): UserSession {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + UserSession.TTL_DAYS);

    const session = new UserSession(
      id,
      tokenId,
      deviceId, // guest ownerId === deviceId — explícito, no null
      'guest',
      deviceId,
      fingerprint,
      expiresAt,
      null,
      new Date(),
    );

    session.record(
      new SessionStartedEvent(id, {
        ownerId: deviceId,
        ownerType: OwnerType.Guest,
        deviceId,
      }),
    );
    return session;
  }

  static fromPrimitives(p: UserSessionPrimitives): UserSession {
    return new UserSession(
      p.id,
      p.tokenId,
      p.ownerId,
      p.ownerType,
      p.deviceId,
      p.fingerprint,
      p.expiresAt,
      p.revokedAt,
      p.createdAt,
    );
  }

  toPrimitives(): UserSessionPrimitives {
    return {
      id: this.id,
      tokenId: this.tokenId,
      ownerId: this.ownerId,
      ownerType: this.ownerType,
      deviceId: this.deviceId,
      fingerprint: this.fingerprint,
      expiresAt: this.expiresAt,
      revokedAt: this.revokedAt,
      createdAt: this.createdAt,
    };
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  isGuest(): boolean {
    return this.ownerType === OwnerType.Guest;
  }

  revoke(): UserSession {
    const revoked = new UserSession(
      this.id,
      this.tokenId,
      this.ownerId,
      this.ownerType,
      this.deviceId,
      this.fingerprint,
      this.expiresAt,
      new Date(),
      this.createdAt,
    );

    revoked.record(
      new SessionRevokedEvent(this.id, {
        ownerId: this.ownerId,
        ownerType: this.ownerType,
      }),
    );
    return revoked;
  }

  rotate(newTokenId: string, newSessionId: string): UserSession {
    const rotated = UserSession.create(
      newSessionId,
      newTokenId,
      this.ownerId,
      this.deviceId,
      this.fingerprint,
    );
    this.record(
      new SessionRotatedEvent(this.id, { newSessionId, ownerId: this.ownerId }),
    );
    return rotated;
  }
}
