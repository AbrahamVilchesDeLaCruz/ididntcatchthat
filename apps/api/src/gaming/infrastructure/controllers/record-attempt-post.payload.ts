import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class RecordAttemptPostPayload {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Flashcard id that was attempted',
  })
  @IsUUID()
  flashcardId: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user answered correctly',
  })
  @IsBoolean()
  correct: boolean;
}
