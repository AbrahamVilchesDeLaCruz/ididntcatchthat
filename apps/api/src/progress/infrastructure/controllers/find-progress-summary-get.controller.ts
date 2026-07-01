import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { apiEnvelopeSchema } from '@/shared/infrastructure/http/response/api-envelope.schema';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ProgressSummaryFinder } from '@/progress/application/find/progress-summary-finder';
import { type ProgressSummary } from '@/progress/domain/progress-summary.query';

@ApiTags('progress')
@ApiBearerAuth('access-token')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class FindProgressSummaryGetController {
  constructor(private readonly finder: ProgressSummaryFinder) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find progress summary for the current user',
    description:
      'Returns aggregated study and game progress metrics for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Progress summary',
    schema: apiEnvelopeSchema({
      currentStreak: 5,
      longestStreak: 12,
      accuracy7d: 0.82,
      totalAttempts: 120,
      weakCount: 8,
      masteredCount: 15,
      gamesCompleted: 7,
      lastPlayedAt: '2026-06-30T12:00:00.000Z',
    }),
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async handler(
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<ProgressSummary>> {
    const data = await this.finder.execute({ userId: user.userId! });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
