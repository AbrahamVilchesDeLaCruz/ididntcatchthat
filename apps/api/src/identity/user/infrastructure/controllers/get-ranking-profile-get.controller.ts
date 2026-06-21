import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { RankingProfileFinder } from '@/identity/user/application/update-profile/ranking-profile-finder';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class GetRankingProfileGetController {
  constructor(private readonly finder: RankingProfileFinder) {}

  @Get('me/ranking-profile')
  @HttpCode(HttpStatus.OK)
  async handler(
    @CurrentUser() user: UserContext,
  ): Promise<{ data: Awaited<ReturnType<RankingProfileFinder['execute']>> }> {
    const data = await this.finder.execute(user.userId!);
    return { data };
  }
}
