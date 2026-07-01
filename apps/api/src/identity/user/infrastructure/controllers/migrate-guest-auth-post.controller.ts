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
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ValidationErrorSwagger } from '@/shared/infrastructure/http/response/validation-error.swagger';
import { GuestProgressMigrator } from '@/identity/user/application/migrate-guest/guest-progress-migrator';
import { MigrateGuestAuthPostPayload } from './migrate-guest-auth-post.payload';

const MIGRATE_GUEST_BODY_EXAMPLE: MigrateGuestAuthPostPayload = {
  guestDeviceId: '550e8400-e29b-41d4-a716-446655440000',
  guestGames: [
    {
      gameId: 'b2c3d4e5-f6a7-4890-bcde-f12345678901',
      phraseId: 'c3d4e5f6-a7b8-4901-cdef-123456789012',
      completedAt: '2026-07-01T12:05:00.000Z',
      score: 850,
      attempts: [
        {
          attemptId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
          answer: 'I want to catch up on my reading',
          isCorrect: true,
          answeredAt: '2026-07-01T12:00:00.000Z',
        },
      ],
    },
  ],
};

@ApiTags('auth')
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
  @ApiBody({
    type: MigrateGuestAuthPostPayload,
    description: 'Guest device id and completed guest games to migrate',
    examples: {
      default: {
        summary: 'Migrate one completed guest game',
        value: MIGRATE_GUEST_BODY_EXAMPLE,
      },
    },
  })
  @ApiNoContentResponse({ description: 'Guest progress migrated successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid guest device id or malformed guest game payload',
    type: ValidationErrorSwagger,
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
