import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import {
  GameSummaryFinder,
  type ResponseGameSummaryFinder,
} from '@/gaming/application/summary/game-summary-finder';

@ApiTags('games')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class GetGameSummaryGetController {
  constructor(private readonly finder: GameSummaryFinder) {}

  @Get(':id/summary')
  @HttpCode(HttpStatus.OK)
  async handler(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ): Promise<ResponseGameSummaryFinder> {
    return this.finder.execute({
      gameId: id,
      userId: user.userId ?? null,
    });
  }
}
