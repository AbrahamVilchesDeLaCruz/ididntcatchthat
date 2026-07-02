import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { type UserStatPeriod } from '@/identity/user/application/stats/user-stats.query';

export class SearchUserStatsGetQuery {
  @ApiPropertyOptional({
    enum: ['24h', '7d', '15d', '30d', '6m', 'all'],
    default: '7d',
    example: '7d',
    description:
      'Time window for user activity metrics. Defaults to 7d when omitted.',
  })
  @IsOptional()
  @IsEnum(['24h', '7d', '15d', '30d', '6m', 'all'])
  period?: UserStatPeriod;
}
