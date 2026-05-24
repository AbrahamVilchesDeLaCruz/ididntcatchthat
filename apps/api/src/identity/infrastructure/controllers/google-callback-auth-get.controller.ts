import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from '@/shared/infrastructure/auth/google.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { OAuthAuthenticator } from '@/identity/application/authenticate/oauth-authenticator';
import crypto from 'crypto';

@ApiTags('auth')
@Controller('auth')
export class GoogleCallbackAuthGetController {
  constructor(private readonly authenticator: OAuthAuthenticator) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth login successful' })
  async handler(
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Headers('accept-language') acceptLanguage: string,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() profile: UserContext,
  ): Promise<{ accessToken: string }> {
    const fingerprint = this.generateFingerprint(userAgent, acceptLanguage, ip);
    const deviceId = profile.deviceId ?? crypto.randomUUID();

    const result = await this.authenticator.execute(
      profile.email ?? '',
      null,
      profile.email?.split('@')[0] ?? 'user',
      deviceId,
      fingerprint,
      ip ?? '',
    );

    res.cookie('refreshToken', deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken };
  }

  private generateFingerprint(
    userAgent: string,
    acceptLanguage: string,
    ip: string,
  ): string {
    return Buffer.from(
      `${userAgent ?? ''}|${acceptLanguage ?? ''}|${ip ?? ''}`,
    ).toString('base64');
  }
}
