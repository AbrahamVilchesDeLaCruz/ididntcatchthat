import { RefreshToken } from '@/identity/domain/refresh-token';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export class RefreshTokenMother {
  static valid(
    overrides?: Partial<{
      id: string;
      tokenId: string;
      userId: string;
      deviceId: string;
    }>,
  ): RefreshToken {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return RefreshToken.create({
      id: overrides?.id ?? UuidMother.random(),
      tokenId: overrides?.tokenId ?? UuidMother.random(),
      userId: overrides?.userId ?? UuidMother.random(),
      deviceId: overrides?.deviceId ?? UuidMother.random(),
      expiresAt,
    });
  }

  static expired(
    overrides?: Partial<{ tokenId: string; userId: string; deviceId: string }>,
  ): RefreshToken {
    const p = this.valid(overrides).toPrimitives();
    const past = new Date();
    past.setDate(past.getDate() - 1);
    return RefreshToken.fromPrimitives({ ...p, expiresAt: past });
  }

  static revoked(
    overrides?: Partial<{ tokenId: string; userId: string; deviceId: string }>,
  ): RefreshToken {
    return this.valid(overrides).revoke();
  }
}
