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
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  expression?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  meaning?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  subcategory?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @IsNotEmpty()
  ipaNotation?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @IsNotEmpty()
  nativeSpeech?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleItem)
  examples?: ExampleItem[];
}
