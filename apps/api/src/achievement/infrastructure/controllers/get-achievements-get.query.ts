import { IsISO8601, IsOptional } from 'class-validator';

export class GetAchievementsGetQuery {
  @IsOptional()
  @IsISO8601()
  since?: string;
}
