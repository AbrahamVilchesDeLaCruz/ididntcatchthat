import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { GuestProgressMigrator } from '@/identity/user/application/migrate-guest/guest-progress-migrator';
import { MigrateGuestAuthPostPayload } from './migrate-guest-auth-post.payload';

@ApiTags('identity')
@ApiBearerAuth('access-token')
@Controller('auth')
export class MigrateGuestAuthPostController {
  constructor(private readonly migrator: GuestProgressMigrator) {}

  @Post('migrate-guest')
  @Throttle({ auth: {} })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Migrate guest progress to authenticated user',
    description:
      'Persists guest game sessions under the currently authenticated user. ' +
      'Requires a valid JWT access token.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid guest device id or malformed guest game payload',
    type: ValidationErrorResponse,
  })
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
