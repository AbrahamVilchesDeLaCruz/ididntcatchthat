import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { RANKING_TYPE_VALUES } from '@/ranking/shared/domain/ranking-type';
import { LEARNING_MODULES } from '@/shared/domain/learning-module';

const RANKING_PERIODS = ['weekly', 'monthly', 'all_time'] as const;

export class SearchRankingsGetQuery {
  @ApiProperty({
    enum: RANKING_TYPE_VALUES,
    example: 'most_active',
  })
  @IsIn(RANKING_TYPE_VALUES)
  type!: (typeof RANKING_TYPE_VALUES)[number];

  @ApiProperty({
    enum: RANKING_PERIODS,
    example: 'weekly',
  })
  @IsIn(RANKING_PERIODS)
  period!: (typeof RANKING_PERIODS)[number];

  @ApiPropertyOptional({
    enum: LEARNING_MODULES,
    example: 'native_sounds',
    description: 'Required when type is module_master',
  })
  @ValidateIf((query: SearchRankingsGetQuery) => query.type === 'module_master')
  @IsNotEmpty()
  @IsIn(LEARNING_MODULES)
  module?: (typeof LEARNING_MODULES)[number];

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
