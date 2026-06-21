import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { RankingFinder } from '@/ranking/application/find/ranking-finder';
import { SearchRankingsGetQuery } from './search-rankings-get.query';

@ApiTags('rankings')
@Controller('rankings')
@UseGuards(JwtAuthGuard)
export class SearchRankingsGetController {
  constructor(private readonly finder: RankingFinder) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handler(
    @CurrentUser() user: UserContext,
    @Query() query: SearchRankingsGetQuery,
  ): Promise<{ data: Awaited<ReturnType<RankingFinder['execute']>> }> {
    return {
      data: await this.finder.execute({
        userId: user.userId!,
        type: query.type,
        period: query.period,
        module: query.module,
        limit: query.limit,
      }),
    };
  }
}
