import {
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordPageViewPostPayload {
  @ApiProperty({
    example: '/games',
    maxLength: 500,
    description: 'SPA route path without query string',
  })
  @IsString()
  @MaxLength(500)
  path: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    maxLength: 100,
    description: 'Anonymous visitor id persisted in browser localStorage',
  })
  @IsString()
  @Length(1, 100)
  visitorId: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
    nullable: true,
    description: 'Authenticated user id when session exists',
  })
  @IsOptional()
  @IsUUID()
  userId?: string | null;

  @ApiPropertyOptional({
    example: 'https://google.com',
    nullable: true,
    description: 'External referrer from document.referrer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  referrer?: string | null;
}
