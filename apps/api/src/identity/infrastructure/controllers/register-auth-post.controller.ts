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
import { UserRegisterer } from '@/identity/application/register/user-registerer';
import { RegisterAuthPostPayload } from './register-auth-post.payload';
import crypto from 'crypto';

@ApiTags('auth')
@Controller('auth')
export class RegisterAuthPostController {
  constructor(private readonly registerer: UserRegisterer) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered' })
  @ApiResponse({ status: 409, description: 'Email or nickname already taken' })
  @ApiResponse({ status: 422, description: 'Weak password or invalid data' })
  async handler(
    @Body() body: RegisterAuthPostPayload,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Headers('accept-language') acceptLanguage: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const fingerprint = Buffer.from(
      `${userAgent ?? ''}|${acceptLanguage ?? ''}|${ip ?? ''}`,
    ).toString('base64');
    const deviceId = body.guestDeviceId ?? crypto.randomUUID();

    const result = await this.registerer.execute({
      id: crypto.randomUUID(),
      email: body.email,
      password: body.password,
      nickname: body.nickname,
      deviceId,
      fingerprint,
      ip: ip ?? '',
    });

    res.cookie('refreshToken', result.deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken };
  }
}
