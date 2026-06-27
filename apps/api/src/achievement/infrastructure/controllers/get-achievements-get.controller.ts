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
import {
  AchievementsFinder,
  type AchievementListItemDto,
} from '@/achievement/application/find/achievements-finder';
import { GetAchievementsGetQuery } from './get-achievements-get.query';

@ApiTags('achievements')
@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class GetAchievementsGetController {
  constructor(private readonly finder: AchievementsFinder) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handler(
    @CurrentUser() user: UserContext,
    @Query() query: GetAchievementsGetQuery,
  ): Promise<{ data: AchievementListItemDto[] }> {
    const data = await this.finder.execute({
      userId: user.userId!,
      since: query.since,
    });
    return { data };
  }
}
