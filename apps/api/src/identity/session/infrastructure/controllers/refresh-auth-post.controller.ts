import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenRefresher } from '@/identity/session/application/refresh/token-refresher';
import { FingerprintBuilder } from '@/shared/infrastructure/fingerprint-builder';

@ApiTags('auth')
@Controller('auth')
export class RefreshAuthPostController {
  constructor(
    private readonly refresher: TokenRefresher,
    private readonly fingerprintBuilder: FingerprintBuilder,
  ) {}

  @Post('refresh')
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken };
  }
}
