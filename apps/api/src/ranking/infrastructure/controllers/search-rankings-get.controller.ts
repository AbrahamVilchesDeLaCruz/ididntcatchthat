import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { RankingFinder } from '@/ranking/application/find/ranking-finder';
import { SearchRankingsGetQuery } from './search-rankings-get.query';

@ApiTags('ranking')
@ApiBearerAuth('access-token')
@Controller('rankings')
@UseGuards(JwtAuthGuard)
export class SearchRankingsGetController {
  constructor(private readonly finder: RankingFinder) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search rankings for the current user',
    description:
      'Returns leaderboard entries, the current user entry when ranked, and viewer visibility status. ' +
      'Requires type and period query parameters; module is required for module_master rankings.',
  })
  @ApiOkResponse({ description: 'Ranking entries with viewer context' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid ranking query parameters',
    type: ValidationErrorResponse,
  })
  async handler(
    @CurrentUser() user: UserContext,
    @Query() query: SearchRankingsGetQuery,
    @Req() req: Request,
  ): Promise<ApiResponse<Awaited<ReturnType<RankingFinder['execute']>>>> {
    const data = await this.finder.execute({
      userId: user.userId!,
      type: query.type,
      period: query.period,
      module: query.module,
      limit: query.limit,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
