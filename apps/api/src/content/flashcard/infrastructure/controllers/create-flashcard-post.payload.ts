import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExampleItem {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  flashcardId: string;

  @IsString()
  @IsNotEmpty()
  textEn: string;

  @IsString()
  @IsNotEmpty()
  textEs: string;

  @IsNotEmpty()
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
  @IsString()
  ipaNotation: string | null = null;

  @IsOptional()
  @IsString()
  nativeSpeech: string | null = null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleItem)
  examples: ExampleItem[];
}
