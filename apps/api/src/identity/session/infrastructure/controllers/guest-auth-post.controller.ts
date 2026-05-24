import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GuestAuthenticator } from '@/identity/session/application/authenticate/guest-authenticator';
import { FingerprintBuilder } from '@/shared/infrastructure/fingerprint-builder';
import { GuestAuthPostPayload } from './guest-auth-post.payload';

@ApiTags('auth')
@Controller('auth')
export class GuestAuthPostController {
  constructor(
    private readonly authenticator: GuestAuthenticator,
    private readonly fingerprintBuilder: FingerprintBuilder,
  ) {}

  @Post('guest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtain a guest token' })
  @ApiResponse({ status: 200, description: 'Guest token issued' })
  async handler(
    @Body() _body: GuestAuthPostPayload,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Headers('accept-language') acceptLanguage: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; deviceId: string }> {
    const fingerprint = this.fingerprintBuilder.fromRequest(
      userAgent,
      acceptLanguage,
      ip,
    );

    const result = await this.authenticator.execute({
      fingerprint,
      ip: ip ?? '',
    });

    res.cookie('refreshToken', result.deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken, deviceId: result.deviceId };
  }
}
