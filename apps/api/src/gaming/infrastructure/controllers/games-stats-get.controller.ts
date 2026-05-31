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
import {
  GamesStatsQuery,
  type GamesStatsSummary,
} from '@/gaming/infrastructure/persistence/games-stats-query';

@ApiTags('admin')
@Controller('admin/games')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class GamesStatsGetController {
  constructor(private readonly query: GamesStatsQuery) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async handler(): Promise<GamesStatsSummary> {
    return this.query.execute();
  }
}
