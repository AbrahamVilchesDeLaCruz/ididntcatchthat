export type RefreshTokenPrimitives = {
  id: string;
  tokenId: string;
  userId: string | null;
  deviceId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

export class RefreshToken {
  private constructor(
    readonly id: string,
    readonly tokenId: string,
    readonly userId: string | null,
    readonly deviceId: string,
    readonly expiresAt: Date,
    readonly revokedAt: Date | null,
    readonly createdAt: Date,
  ) {}

  private static readonly TTL_DAYS = 30;

  static create(
    id: string,
    tokenId: string,
    userId: string | null,
    deviceId: string,
  ): RefreshToken {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RefreshToken.TTL_DAYS);

    return new RefreshToken(
      id,
      tokenId,
      userId,
      deviceId,
      expiresAt,
      null,
      new Date(),
    );
  }

  static fromPrimitives(p: RefreshTokenPrimitives): RefreshToken {
    return new RefreshToken(
      p.id,
      p.tokenId,
      p.userId,
      p.deviceId,
      p.expiresAt,
      p.revokedAt,
      p.createdAt,
    );
  }

  toPrimitives(): RefreshTokenPrimitives {
    return {
      id: this.id,
      tokenId: this.tokenId,
      userId: this.userId,
      deviceId: this.deviceId,
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

  revoke(): RefreshToken {
    return new RefreshToken(
      this.id,
      this.tokenId,
      this.userId,
      this.deviceId,
      this.expiresAt,
      new Date(),
      this.createdAt,
    );
  }
}
