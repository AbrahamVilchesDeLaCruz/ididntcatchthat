import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { type StatPeriod } from '@/gaming/application/stats/response-game-stats-retriever';

export class SearchGamesStatsGetQuery {
  @ApiPropertyOptional({
    enum: ['24h', '7d', '15d', '30d', '6m', 'all'],
    default: '7d',
    example: '7d',
    description:
      'Time window for game metrics aggregation. Defaults to 7d when omitted.',
  })
  @IsOptional()
  @IsEnum(['24h', '7d', '15d', '30d', '6m', 'all'])
  period?: StatPeriod;
}
