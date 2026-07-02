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
import {
  AchievementsSearcher,
  type ResponseAchievementsSearcherItemPrimitives,
} from '@/achievement/user-achievement/application/search/achievements-searcher';
import { SearchAchievementsGetQuery } from './search-achievements-get.query';

@ApiTags('achievement')
@ApiBearerAuth('access-token')
@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class SearchAchievementsGetController {
  constructor(private readonly searcher: AchievementsSearcher) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search achievements for the current user',
    description:
      'Returns the full achievement catalog merged with unlock state for the authenticated user. ' +
      'Titles and descriptions are resolved in the client via i18n (`achievements.items.{key}`).',
  })
  @ApiOkResponse({ description: 'Achievement catalog with unlock state' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid query parameter (e.g. malformed since)',
  })
  async handler(
    @CurrentUser() user: UserContext,
    @Query() query: SearchAchievementsGetQuery,
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseAchievementsSearcherItemPrimitives[]>> {
    const data = await this.searcher.execute({
      userId: user.userId!,
      since: query.since,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
