import { IsBoolean, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRankingProfilePatchPayload {
  @ApiProperty({ example: true })
  @IsBoolean()
  showInRanking!: boolean;

  @ApiProperty({ example: 'learner42', minLength: 3, maxLength: 30 })
  @IsString()
  @Length(3, 30)
  nickname!: string;
}
