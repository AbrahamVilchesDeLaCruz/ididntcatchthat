import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
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
  ): Promise<ResponseGameStatsRetriever> {
    return this.retriever.execute(query.period ?? '7d');
  }
}
