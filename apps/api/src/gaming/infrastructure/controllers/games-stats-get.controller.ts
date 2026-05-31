import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { GameStatsRetriever } from '@/gaming/application/stats/game-stats-retriever';
import { type ResponseGameStatsRetriever } from '@/gaming/application/stats/response-game-stats-retriever';

@ApiTags('admin')
@Controller('admin/games')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class GamesStatsGetController {
  constructor(private readonly retriever: GameStatsRetriever) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async handler(): Promise<ResponseGameStatsRetriever> {
    return this.retriever.execute();
  }
}
