import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class GuestGameAttemptPayload {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
    description: 'Unique attempt identifier',
  })
  @IsUUID()
  attemptId!: string;

  @ApiProperty({
    example: 'I want to catch up on my reading',
    description: 'User answer submitted for the attempt',
  })
  @IsString()
  answer!: string;

  @ApiProperty({
    example: true,
    description: 'Whether the answer was marked correct',
  })
  @IsBoolean()
  isCorrect!: boolean;

  @ApiProperty({
    example: '2026-07-01T12:00:00.000Z',
    description: 'ISO 8601 timestamp when the attempt was submitted',
  })
  @IsDateString()
  answeredAt!: string;
}

class GuestGamePayload {
  @ApiProperty({
    example: 'b2c3d4e5-f6a7-4890-bcde-f12345678901',
    description: 'Completed game identifier',
  })
  @IsUUID()
  gameId!: string;

  @ApiProperty({
    example: 'c3d4e5f6-a7b8-4901-cdef-123456789012',
    description: 'Phrase identifier within the game',
  })
  @IsUUID()
  phraseId!: string;

  @ApiProperty({
    example: '2026-07-01T12:05:00.000Z',
    description: 'ISO 8601 timestamp when the game was completed',
  })
  @IsDateString()
  completedAt!: string;

  @ApiProperty({
    example: 850,
    description: 'Final score for the completed game',
  })
  @IsNumber()
  score!: number;

  @ApiProperty({
    type: [GuestGameAttemptPayload],
    description: 'All attempts recorded during the guest game session',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestGameAttemptPayload)
  attempts!: GuestGameAttemptPayload[];
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
    description: 'Guest game sessions to persist under the authenticated user',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestGamePayload)
  guestGames!: GuestGamePayload[];
}
