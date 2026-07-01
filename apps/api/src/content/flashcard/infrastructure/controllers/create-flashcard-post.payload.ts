import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExampleItem {
  @ApiProperty({ example: '660e8400-e29b-41d4-a716-446655440001' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'I need to catch up on my emails.' })
  @IsString()
  @IsNotEmpty()
  textEn: string;

  @ApiProperty({ example: 'Necesito ponerme al día con mis correos.' })
  @IsString()
  @IsNotEmpty()
  textEs: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 3 })
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(3)
  position: number;
}

export class CreateFlashcardPostPayload {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'catch up' })
  @IsString()
  @IsNotEmpty()
  expression: string;

  @ApiProperty({ example: 'ponerse al día' })
  @IsString()
  @IsNotEmpty()
  meaning: string;

  @ApiProperty({ example: 'phrasal_verbs' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'daily_life' })
  @IsString()
  @IsNotEmpty()
  subcategory: string;

  @ApiPropertyOptional({ example: '/kætʃ ʌp/', nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @IsNotEmpty()
  ipaNotation: string | null = null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @IsNotEmpty()
  nativeSpeech: string | null = null;

  @ApiProperty({ type: [ExampleItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleItem)
  examples: ExampleItem[];
}

export const CREATE_FLASHCARD_POST_PAYLOAD_EXAMPLE: CreateFlashcardPostPayload =
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    expression: 'catch up',
    meaning: 'ponerse al día',
    category: 'phrasal_verbs',
    subcategory: 'daily_life',
    ipaNotation: '/kætʃ ʌp/',
    nativeSpeech: null,
    examples: [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        textEn: 'I need to catch up on my emails.',
        textEs: 'Necesito ponerme al día con mis correos.',
        position: 1,
      },
    ],
  };
