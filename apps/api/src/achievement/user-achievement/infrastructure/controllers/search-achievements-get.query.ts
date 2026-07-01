import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class SearchAchievementsGetQuery {
  @ApiPropertyOptional({
    description:
      'ISO8601 timestamp — return only achievements unlocked at or after this date',
    example: '2026-06-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  since?: string;
}
