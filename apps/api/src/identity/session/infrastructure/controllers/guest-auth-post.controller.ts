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
import { ConfigService } from '@nestjs/config';
import { COOKIE_MAX_AGE_MS } from '@/identity/shared/domain/cookie-constants';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GuestAuthenticator } from '@/identity/session/application/authenticate/guest-authenticator';
import { FingerprintBuilder } from '@/shared/infrastructure/fingerprint-builder';
import { ValidationErrorSwagger } from '@/shared/infrastructure/http/response/validation-error.swagger';
import { GuestAuthPostPayload } from './guest-auth-post.payload';

const GUEST_BODY_EXAMPLE: GuestAuthPostPayload = {
  guestDeviceId: '550e8400-e29b-41d4-a716-446655440000',
};

@ApiTags('auth')
@Controller('auth')
export class GuestAuthPostController {
  constructor(
    private readonly authenticator: GuestAuthenticator,
    private readonly fingerprintBuilder: FingerprintBuilder,
    private readonly config: ConfigService,
  ) {}

  @Post('guest')
  @Throttle({ auth: {} })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtain a guest access token',
    description:
      'Issues a short-lived JWT for anonymous browsing and game play. ' +
      'Sets an httpOnly refresh cookie keyed by device id. No authentication required.',
  })
  @ApiBody({
    type: GuestAuthPostPayload,
    description:
      'Optional guest device id to resume an existing anonymous session',
    examples: {
      withDeviceId: {
        summary: 'Resume existing guest session',
        value: GUEST_BODY_EXAMPLE,
      },
      newSession: {
        summary: 'Start a new guest session',
        value: {},
      },
    },
  })
  @ApiOkResponse({
    description:
      'Guest token issued with device id for client-side persistence',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid guest device id format',
    type: ValidationErrorSwagger,
  })
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
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE_MS,
    });

    return { accessToken: result.accessToken, deviceId: result.deviceId };
  }
}
