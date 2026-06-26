import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class GenerateFlashcardsPostPayload {
  @IsString()
  @MaxLength(100)
  category!: string;

  @IsString()
  @MaxLength(100)
  subcategory!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  count?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  prompt?: string;
}
