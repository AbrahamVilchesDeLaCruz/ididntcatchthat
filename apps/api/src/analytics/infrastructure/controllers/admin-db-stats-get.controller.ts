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
import { DbStatsRetriever } from '@/analytics/application/db-stats/db-stats-retriever';
import {
  type ResponseDbStats,
  type StatPeriod,
} from '@/analytics/application/db-stats/db-stats.response';

class DbStatsQuery {
  @IsOptional()
  @IsEnum(['24h', '7d', '15d', '30d', '6m', 'all'])
  period?: StatPeriod;
}

@ApiTags('admin')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminDbStatsGetController {
  constructor(private readonly retriever: DbStatsRetriever) {}

  @Get('db-stats')
  @HttpCode(HttpStatus.OK)
  async handler(@Query() query: DbStatsQuery): Promise<ResponseDbStats> {
    return this.retriever.execute(query.period ?? '7d');
  }
}
