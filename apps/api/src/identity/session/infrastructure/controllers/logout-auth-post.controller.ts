import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { SessionRevoker } from '@/identity/session/application/logout/session-revoker';

@ApiTags('identity')
@ApiBearerAuth('access-token')
@Controller('auth')
export class LogoutAuthPostController {
  constructor(
    private readonly revoker: SessionRevoker,
    private readonly config: ConfigService,
  ) {}

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Logout and revoke refresh token',
    description:
      'Revokes the current refresh token session and clears the httpOnly cookie. ' +
      'Requires a valid JWT access token in the Authorization header.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiNoContentResponse({ description: 'Session revoked and cookie cleared' })
  async handler(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() _user: UserContext,
  ): Promise<void> {
    const tokenId: string =
      (req.cookies as Record<string, string>)['refreshToken'] ?? '';

    await this.revoker.execute({ tokenId });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
    });
  }
}
