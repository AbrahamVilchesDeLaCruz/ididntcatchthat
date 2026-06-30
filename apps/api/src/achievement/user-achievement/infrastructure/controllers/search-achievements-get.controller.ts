import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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

@ApiTags('achievements')
@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class SearchAchievementsGetController {
  constructor(private readonly searcher: AchievementsSearcher) {}

  @Get()
  @HttpCode(HttpStatus.OK)
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
