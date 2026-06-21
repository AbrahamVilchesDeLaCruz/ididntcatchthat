import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { RankingProfileUpdater } from '@/identity/user/application/update-profile/ranking-profile-updater';
import { RankingUpdater } from '@/ranking/application/update/ranking-updater';
import { UpdateRankingProfilePatchPayload } from './update-ranking-profile-patch.payload';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UpdateRankingProfilePatchController {
  constructor(
    private readonly updater: RankingProfileUpdater,
    private readonly rankingUpdater: RankingUpdater,
  ) {}

  @Patch('me/ranking-profile')
  @HttpCode(HttpStatus.OK)
  async handler(
    @CurrentUser() user: UserContext,
    @Body() body: UpdateRankingProfilePatchPayload,
  ): Promise<{ data: Awaited<ReturnType<RankingProfileUpdater['execute']>> }> {
    const data = await this.updater.execute({
      userId: user.userId!,
      showInRanking: body.showInRanking,
      nickname: body.nickname,
    });

    await this.rankingUpdater.syncProfile(
      user.userId!,
      data.showInRanking,
      data.nickname,
    );

    return { data };
  }
}
