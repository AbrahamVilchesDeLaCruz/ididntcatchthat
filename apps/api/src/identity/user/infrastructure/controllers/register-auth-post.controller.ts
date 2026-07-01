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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRegistrar } from '@/identity/user/application/register/user-registrar';
import { FingerprintBuilder } from '@/shared/infrastructure/fingerprint-builder';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { RegisterAuthPostPayload } from './register-auth-post.payload';
import crypto from 'crypto';

@ApiTags('identity')
@Controller('auth')
export class RegisterAuthPostController {
  constructor(
    private readonly registrar: UserRegistrar,
    private readonly fingerprintBuilder: FingerprintBuilder,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ auth: {} })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user account',
    description:
      'Creates a new user with email, password and nickname. ' +
      'Returns a JWT access token and sets an httpOnly refresh token cookie.',
  })
  @ApiCreatedResponse({
    description:
      'User registered — access token returned, refresh token set as cookie',
    schema: {
      example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiConflictResponse({ description: 'Email or nickname already taken' })
  @ApiUnprocessableEntityResponse({
    description:
      'Weak password, invalid email or nickname constraints violated',
    type: ValidationErrorResponse,
  })
  async handler(
    @Body() body: RegisterAuthPostPayload,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Headers('accept-language') acceptLanguage: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const fingerprint = this.fingerprintBuilder.fromRequest(
      userAgent,
      acceptLanguage,
      ip,
    );
    const deviceId = body.guestDeviceId ?? crypto.randomUUID();

    const result = await this.registrar.execute({
      id: crypto.randomUUID(),
      email: body.email,
      password: body.password,
      nickname: body.nickname,
      deviceId,
      fingerprint,
      ip: ip ?? '',
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
