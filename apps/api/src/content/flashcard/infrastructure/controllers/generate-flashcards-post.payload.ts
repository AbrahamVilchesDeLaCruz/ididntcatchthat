import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class GenerateFlashcardsPostPayload {
  @ApiProperty({ example: 'phrasal_verbs', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  category!: string;

  @ApiProperty({ example: 'daily_life', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  subcategory!: string;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  count?: number;

  @ApiPropertyOptional({
    example: 'Common phrasal verbs about work and daily routines',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  prompt?: string;
}
