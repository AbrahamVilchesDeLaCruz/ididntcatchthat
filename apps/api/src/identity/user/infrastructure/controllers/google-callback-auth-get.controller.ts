import { Controller, Get, Headers, Ip, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from '@/shared/infrastructure/auth/google.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { OAuthAuthenticator } from '@/identity/user/application/authenticate/oauth-authenticator';
import { FingerprintBuilder } from '@/shared/infrastructure/fingerprint-builder';
import { COOKIE_MAX_AGE_MS } from '@/identity/shared/domain/cookie-constants';
import crypto from 'crypto';

@ApiTags('identity')
@Controller('auth')
export class GoogleCallbackAuthGetController {
  constructor(
    private readonly authenticator: OAuthAuthenticator,
    private readonly fingerprintBuilder: FingerprintBuilder,
    private readonly config: ConfigService,
  ) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback handler',
    description:
      'Handles the redirect from Google after OAuth consent. ' +
      'Issues JWT access token and refresh cookie, then redirects to the frontend callback URL.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend /auth/callback?token=<accessToken>',
  })
  async handler(
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Headers('accept-language') acceptLanguage: string,
    @Res() res: Response,
    @CurrentUser() profile: UserContext,
  ): Promise<void> {
    const fingerprint = this.fingerprintBuilder.fromRequest(
      userAgent,
      acceptLanguage,
      ip,
    );
    const deviceId = profile.deviceId ?? crypto.randomUUID();

    const result = await this.authenticator.execute({
      email: profile.email ?? '',
      avatarUrl: null,
      displayName: profile.email?.split('@')[0] ?? 'user',
      deviceId,
      fingerprint,
      ip: ip ?? '',
    });

    res.cookie('refreshToken', deviceId, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE_MS,
    });

    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:4001',
    );

    res.redirect(
      302,
      `${frontendUrl}/auth/callback?token=${result.accessToken}`,
    );
  }
}
