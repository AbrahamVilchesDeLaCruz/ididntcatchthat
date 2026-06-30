import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { type Request } from 'express';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
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
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseGameSummaryFinder>> {
    const data = await this.finder.execute({
      gameId: id,
      userId: user.userId ?? null,
    });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
