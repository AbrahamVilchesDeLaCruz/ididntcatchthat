import { IsBoolean, IsString, Length } from 'class-validator';

export class UpdateRankingProfilePatchPayload {
  @IsBoolean()
  showInRanking!: boolean;

  @IsString()
  @Length(3, 30)
  nickname!: string;
}
