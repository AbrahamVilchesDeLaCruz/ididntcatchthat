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
import { IsEnum, IsOptional } from 'class-validator';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { GameStatsRetriever } from '@/gaming/application/stats/game-stats-retriever';
import {
  type ResponseGameStatsRetriever,
  type StatPeriod,
} from '@/gaming/application/stats/response-game-stats-retriever';

class GamesStatsQueryParams {
  @IsOptional()
  @IsEnum(['24h', '7d', '15d', '30d', '6m', 'all'])
  period?: StatPeriod;
}

@ApiTags('admin')
@Controller('admin/games')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class GamesStatsGetController {
  constructor(private readonly retriever: GameStatsRetriever) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async handler(
    @Query() query: GamesStatsQueryParams,
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseGameStatsRetriever>> {
    const data = await this.retriever.execute(query.period ?? '7d');
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
