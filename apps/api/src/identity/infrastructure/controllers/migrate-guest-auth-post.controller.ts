import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { GuestProgressMigrator } from '@/identity/application/migrate-guest/guest-progress-migrator';
import { MigrateGuestAuthPostPayload } from './migrate-guest-auth-post.payload';

@ApiTags('auth')
@Controller('auth')
export class MigrateGuestAuthPostController {
  constructor(private readonly migrator: GuestProgressMigrator) {}

  @Post('migrate-guest')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Migrate guest progress to registered user' })
  @ApiResponse({ status: 204, description: 'Migration complete' })
  async handler(
    @Body() body: MigrateGuestAuthPostPayload,
    @CurrentUser() user: UserContext,
  ): Promise<void> {
    await this.migrator.execute({
      userId: user.userId!,
      deviceId: user.deviceId,
      guestDeviceId: body.guestDeviceId,
      guestGames: body.guestGames.map((g) => ({
        gameId: g.gameId,
        phraseId: g.phraseId,
        completedAt: new Date(g.completedAt),
        score: g.score,
        attempts: g.attempts.map((a) => ({
          attemptId: a.attemptId,
          answer: a.answer,
          isCorrect: a.isCorrect,
          answeredAt: new Date(a.answeredAt),
        })),
      })),
    });
  }
}
