import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginAuthPostPayload {
  @ApiProperty({
    example: 'user@example.com',
    maxLength: 254,
    description: 'Registered user email address',
  })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    example: 'mySecurePassword123',
    description: 'Account password',
  })
  @IsString()
  password!: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      'Optional guest device id to link prior guest progress on login',
  })
  @IsOptional()
  @IsString()
  guestDeviceId?: string;
}
