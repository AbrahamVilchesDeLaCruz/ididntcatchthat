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
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { API_ENVELOPE_META_SCHEMA } from '@/shared/infrastructure/http/response/api-envelope.schema';
import { RankingProfileFinder } from '@/identity/user/application/update-profile/ranking-profile-finder';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class GetRankingProfileGetController {
  constructor(private readonly finder: RankingProfileFinder) {}

  @Get('me/ranking-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the current user ranking profile' })
  @ApiOkResponse({
    description: 'Ranking profile for the authenticated user',
    schema: {
      type: 'object',
      required: ['data', 'meta'],
      properties: {
        data: {
          type: 'object',
          properties: {
            showInRanking: { type: 'boolean', example: true },
            nickname: { type: 'string', example: 'learner42' },
          },
        },
        meta: API_ENVELOPE_META_SCHEMA,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async handler(
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<
    ApiResponse<Awaited<ReturnType<RankingProfileFinder['execute']>>>
  > {
    const data = await this.finder.execute(user.userId!);
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
