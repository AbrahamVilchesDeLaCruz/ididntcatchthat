import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GuestAuthPostPayload {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Optional existing guest device id to resume a prior session',
  })
  @IsOptional()
  @IsString()
  guestDeviceId?: string;
}
