import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

const RANKING_TYPES = [
  'most_active',
  'most_accurate',
  'top_scorer',
  'best_streak',
  'module_master',
] as const;

const RANKING_PERIODS = ['weekly', 'monthly', 'all_time'] as const;

const MODULES = [
  'native_sounds',
  'connected_speech',
  'flow_connectors',
  'real_talk',
] as const;

export class SearchRankingsGetQuery {
  @ApiProperty({
    enum: RANKING_TYPES,
    example: 'most_active',
  })
  @IsIn(RANKING_TYPES)
  type!: (typeof RANKING_TYPES)[number];

  @ApiProperty({
    enum: RANKING_PERIODS,
    example: 'weekly',
  })
  @IsIn(RANKING_PERIODS)
  period!: (typeof RANKING_PERIODS)[number];

  @ApiPropertyOptional({
    enum: MODULES,
    example: 'native_sounds',
    description: 'Required when type is module_master',
  })
  @IsOptional()
  @IsIn(MODULES)
  module?: (typeof MODULES)[number];

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
