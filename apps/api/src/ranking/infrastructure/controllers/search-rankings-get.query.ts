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
  @IsIn(RANKING_TYPES)
  type!: (typeof RANKING_TYPES)[number];

  @IsIn(RANKING_PERIODS)
  period!: (typeof RANKING_PERIODS)[number];

  @IsOptional()
  @IsIn(MODULES)
  module?: (typeof MODULES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
