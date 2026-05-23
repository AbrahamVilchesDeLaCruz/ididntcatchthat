import { Inject, Injectable } from '@nestjs/common';
import { Criteria } from '@/shared/domain/criteria';
import {
  type RefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@/identity/domain/refresh-token.repository';

@Injectable()
export class UserLogouter {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(params: { tokenId: string }): Promise<void> {
    const [token] = await this.refreshTokenRepository.match(
      new Criteria([
        { field: 'tokenId', operator: '=', value: params.tokenId },
      ]),
    );

    if (!token || token.isRevoked()) return; // idempotent

    await this.refreshTokenRepository.save(token.revoke());
  }
}
