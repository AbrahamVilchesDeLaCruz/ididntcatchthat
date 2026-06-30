import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { PausedGamesLister } from '@/gaming/application/list-paused/paused-games-lister';
import { type GamePrimitives } from '@/gaming/domain/game';

@ApiTags('games')
@Controller('games')
@UseGuards(JwtAuthGuard)
export class ListPausedGamesGetController {
  constructor(private readonly lister: PausedGamesLister) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handler(
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<GamePrimitives[]>> {
    const data = await this.lister.execute({ userId: user.userId! });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
