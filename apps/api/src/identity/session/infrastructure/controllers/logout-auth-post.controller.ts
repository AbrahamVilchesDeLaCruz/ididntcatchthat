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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { SessionRevoker } from '@/identity/session/application/logout/session-revoker';

@ApiTags('auth')
@Controller('auth')
export class LogoutAuthPostController {
  constructor(
    private readonly revoker: SessionRevoker,
    private readonly config: ConfigService,
  ) {}

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout — revoke refresh token' })
  @ApiResponse({ status: 204, description: 'Logged out' })
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
