export type RefreshTokenPrimitives = {
  id: string;
  tokenId: string;
  userId: string;
  deviceId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

export class RefreshToken {
  private constructor(
    readonly id: string,
    readonly tokenId: string,
    readonly userId: string,
    readonly deviceId: string,
    readonly expiresAt: Date,
    readonly revokedAt: Date | null,
    readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    tokenId: string;
    userId: string;
    deviceId: string;
    expiresAt: Date;
  }): RefreshToken {
    return new RefreshToken(
      params.id,
      params.tokenId,
      params.userId,
      params.deviceId,
      params.expiresAt,
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
