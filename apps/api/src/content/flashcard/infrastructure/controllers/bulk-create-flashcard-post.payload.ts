import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CREATE_FLASHCARD_POST_PAYLOAD_EXAMPLE,
  CreateFlashcardPostPayload,
} from './create-flashcard-post.payload';

export class BulkCreateFlashcardPostPayload {
  @ApiProperty({
    type: [CreateFlashcardPostPayload],
    example: [CREATE_FLASHCARD_POST_PAYLOAD_EXAMPLE],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFlashcardPostPayload)
  flashcards: CreateFlashcardPostPayload[];
}
