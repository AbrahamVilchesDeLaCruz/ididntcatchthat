import { RefreshToken } from '@/identity/domain/refresh-token';
import { UuidMother } from '@test/shared/domain/uuid-mother';

export class RefreshTokenMother {
  static valid(
    overrides?: Partial<{
      id: string;
      tokenId: string;
      userId: string | null;
      deviceId: string;
    }>,
  ): RefreshToken {
    return RefreshToken.create(
      overrides?.id ?? UuidMother.random(),
      overrides?.tokenId ?? UuidMother.random(),
      overrides?.userId !== undefined ? overrides.userId : UuidMother.random(),
      overrides?.deviceId ?? UuidMother.random(),
    );
  }

  static expired(
    overrides?: Partial<{
      tokenId: string;
      userId: string | null;
      deviceId: string;
    }>,
  ): RefreshToken {
    const p = this.valid(overrides).toPrimitives();
    const past = new Date();
    past.setDate(past.getDate() - 1);
    return RefreshToken.fromPrimitives({ ...p, expiresAt: past });
  }

  static revoked(
    overrides?: Partial<{
      tokenId: string;
      userId: string | null;
      deviceId: string;
    }>,
  ): RefreshToken {
    return this.valid(overrides).revoke();
  }
}
