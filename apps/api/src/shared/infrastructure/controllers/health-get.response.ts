import { ApiProperty } from '@nestjs/swagger';

export class HealthResponse {
  @ApiProperty({
    description: 'Overall service status',
    example: 'ok',
    enum: ['ok'],
  })
  status: string;

  @ApiProperty({
    description: 'ISO 8601 timestamp of when the health check was requested',
    example: '2026-05-22T12:00:00.000Z',
  })
  timestamp: string;
}
