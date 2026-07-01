import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterAuthPostPayload {
  @ApiProperty({
    example: 'user@example.com',
    maxLength: 254,
    description: 'Email address for the new account',
  })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    example: 'mySecurePassword123',
    minLength: 8,
    description: 'Password (minimum 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    example: 'englishLearner',
    minLength: 3,
    maxLength: 30,
    description: 'Public display nickname',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  nickname!: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      'Optional guest device id to migrate guest progress on registration',
  })
  @IsOptional()
  @IsString()
  guestDeviceId?: string;
}
