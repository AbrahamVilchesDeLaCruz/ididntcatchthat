import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseMetaSwagger {
  @ApiProperty({
    example: '2026-06-30T12:00:00.000Z',
    format: 'date-time',
  })
  timestamp: string;

  @ApiProperty({ example: 'req_abc123' })
  request_id: string;
}
