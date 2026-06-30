import { IsISO8601, IsOptional } from 'class-validator';

export class SearchAchievementsGetQuery {
  @IsOptional()
  @IsISO8601()
  since?: string;
}
