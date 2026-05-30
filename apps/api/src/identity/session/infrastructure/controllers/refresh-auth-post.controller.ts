import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { COOKIE_MAX_AGE_MS } from '@/identity/shared/domain/cookie-constants';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TokenRefresher } from '@/identity/session/application/refresh/token-refresher';
import { FingerprintBuilder } from '@/shared/infrastructure/fingerprint-builder';

@ApiTags('auth')
@Controller('auth')
export class RefreshAuthPostController {
  constructor(
    private readonly refresher: TokenRefresher,
    private readonly fingerprintBuilder: FingerprintBuilder,
    private readonly config: ConfigService,
  ) {}

  @Post('refresh')
  @Throttle({ auth: {} })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiResponse({ status: 200, description: 'New access token issued' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async handler(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokenId: string =
      (req.cookies as Record<string, string> | undefined)?.['refreshToken'] ??
      '';
    const fingerprint = this.fingerprintBuilder.fromRequest(
      req.headers['user-agent'] ?? '',
      req.headers['accept-language'] ?? '',
      req.ip ?? '',
    );
    const ip = req.ip ?? '';
    const deviceId = tokenId;

    const result = await this.refresher.execute({
      tokenId,
      deviceId,
      fingerprint,
      ip,
    });

    res.cookie('refreshToken', result.refreshTokenId, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE_MS,
    });

    return { accessToken: result.accessToken };
  }
}
