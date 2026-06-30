import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { type SummaryPeriod } from '@/analytics/summary/application/response-analytics-summary-retriever';

export class GetAnalyticsSummaryGetQuery {
  @ApiPropertyOptional({
    enum: ['24h', '7d', '15d', '30d', '6m', 'all'],
    default: '7d',
    example: '7d',
  })
  @IsOptional()
  @IsEnum(['24h', '7d', '15d', '30d', '6m', 'all'])
  period?: SummaryPeriod;
}
