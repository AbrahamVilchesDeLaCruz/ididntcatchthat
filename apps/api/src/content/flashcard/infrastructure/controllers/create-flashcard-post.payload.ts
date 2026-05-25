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
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  textEn: string;

  @IsString()
  @IsNotEmpty()
  textEs: string;

  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(3)
  position: number;
}

export class CreateFlashcardPostPayload {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  expression: string;

  @IsString()
  @IsNotEmpty()
  meaning: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  subcategory: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @IsNotEmpty()
  ipaNotation: string | null = null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @IsNotEmpty()
  nativeSpeech: string | null = null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleItem)
  examples: ExampleItem[];
}
