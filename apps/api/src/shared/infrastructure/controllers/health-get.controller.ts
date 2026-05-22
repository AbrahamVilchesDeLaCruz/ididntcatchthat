import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface HealthGetResponse {
  status: string;
  timestamp: string;
}

@ApiTags('health')
@Controller('health')
export class HealthGetController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Health check',
    description:
      'Verifies the service is up and responding. Does not check external dependencies (DB, RabbitMQ) — use the readiness endpoint for that when available.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is operational',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-05-22T14:00:00.000Z' },
      },
    },
  })
  handler(): HealthGetResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
