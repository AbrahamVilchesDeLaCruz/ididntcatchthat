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
import { UserLogger } from '@/identity/application/login/user-logger';
import { LoginAuthPostPayload } from './login-auth-post.payload';
import crypto from 'crypto';

@ApiTags('auth')
@Controller('auth')
export class LoginAuthPostController {
  constructor(private readonly logger: UserLogger) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async handler(
    @Body() body: LoginAuthPostPayload,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Headers('accept-language') acceptLanguage: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const fingerprint = Buffer.from(
      `${userAgent ?? ''}|${acceptLanguage ?? ''}|${ip ?? ''}`,
    ).toString('base64');
    const deviceId = body.guestDeviceId ?? crypto.randomUUID();

    const result = await this.logger.execute({
      email: body.email,
      password: body.password,
      deviceId,
      fingerprint,
      ip: ip ?? '',
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
