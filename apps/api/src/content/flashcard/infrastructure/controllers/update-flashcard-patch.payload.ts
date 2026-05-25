import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExampleItem } from './create-flashcard-post.payload';

export class UpdateFlashcardPatchPayload {
  @IsOptional()
  @IsString()
  expression?: string;

  @IsOptional()
  @IsString()
  meaning?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  ipaNotation?: string | null;

  @IsOptional()
  @IsString()
  nativeSpeech?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleItem)
  examples?: ExampleItem[];
}
