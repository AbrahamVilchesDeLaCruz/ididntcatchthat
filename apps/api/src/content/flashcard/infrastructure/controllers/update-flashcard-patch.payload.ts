import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExampleItem } from './create-flashcard-post.payload';

export class UpdateFlashcardPatchPayload {
  @ApiPropertyOptional({ example: 'catch up' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  expression?: string;

  @ApiPropertyOptional({ example: 'ponerse al día' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  meaning?: string;

  @ApiPropertyOptional({ example: 'phrasal_verbs' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @ApiPropertyOptional({ example: 'daily_life' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  subcategory?: string;

  @ApiPropertyOptional({ example: '/kætʃ ʌp/', nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @IsNotEmpty()
  ipaNotation?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @IsNotEmpty()
  nativeSpeech?: string | null;

  @ApiPropertyOptional({ type: [ExampleItem] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleItem)
  examples?: ExampleItem[];
}
