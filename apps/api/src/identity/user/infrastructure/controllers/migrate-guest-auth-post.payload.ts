import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class GuestGamePayload {
  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4890-bcde-f12345678901',
    description: 'Guest game identifier to reassign to the authenticated user',
  })
  @IsUUID()
  gameId!: string;

  @ApiPropertyOptional({
    example: 'c3d4e5f6-a7b8-4901-cdef-123456789012',
    description: 'Flashcard id from client-side guest stats (informational)',
  })
  @IsOptional()
  @IsUUID()
  flashcardId?: string;

  @ApiPropertyOptional({ example: 850, description: 'Final score' })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ example: 120000, description: 'Duration in ms' })
  @IsOptional()
  @IsNumber()
  durationMs?: number;

  @ApiPropertyOptional({
    example: '2026-07-01T12:05:00.000Z',
    description: 'When the game was played (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  playedAt?: string;
}

export class MigrateGuestAuthPostPayload {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Guest device id whose progress should be migrated',
  })
  @IsString()
  guestDeviceId!: string;

  @ApiProperty({
    type: [GuestGamePayload],
    description:
      'Guest game sessions to persist under the authenticated user (only gameId is required server-side)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestGamePayload)
  guestGames!: GuestGamePayload[];
}
