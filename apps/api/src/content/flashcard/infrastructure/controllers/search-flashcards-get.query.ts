import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFlashcardsGetQuery {
  @ApiPropertyOptional({ example: 'catch up' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/^[a-zA-Z0-9\s'-]*$/)
  query?: string;

  @ApiPropertyOptional({ example: 'native_sounds' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'vowel_sounds' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({
    enum: ['pending', 'generating', 'ready', 'failed'],
    example: 'ready',
  })
  @IsOptional()
  @IsIn(['pending', 'generating', 'ready', 'failed'])
  audioStatus?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
