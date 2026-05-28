import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFlashcardPostPayload } from './create-flashcard-post.payload';

export class BulkCreateFlashcardPostPayload {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFlashcardPostPayload)
  flashcards: CreateFlashcardPostPayload[];
}
