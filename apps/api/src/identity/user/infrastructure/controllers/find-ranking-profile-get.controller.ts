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
import { RankingProfileFinder } from '@/identity/user/application/update-profile/ranking-profile-finder';

@ApiTags('identity')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class FindRankingProfileGetController {
  constructor(private readonly finder: RankingProfileFinder) {}

  @Get('me/ranking-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find the current user ranking profile' })
  @ApiOkResponse({
    description: 'Ranking profile for the authenticated user',
    schema: apiEnvelopeSchema({
      showInRanking: true,
      nickname: 'learner42',
    }),
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
