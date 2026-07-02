import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

const PATCH_STATUSES = ['paused', 'abandoned'] as const;

export class PatchGamePayload {
  @ApiProperty({
    enum: PATCH_STATUSES,
    example: 'paused',
    description: 'Target game status — paused or abandoned',
  })
  @IsEnum(PATCH_STATUSES)
  status: 'paused' | 'abandoned';

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Last viewed flashcard id — required when status is paused',
  })
  @IsOptional()
  @IsUUID()
  lastFlashcardId?: string;
}
