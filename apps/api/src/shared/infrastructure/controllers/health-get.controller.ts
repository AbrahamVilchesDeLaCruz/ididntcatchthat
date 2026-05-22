import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponse } from './health-get.response';

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
    type: HealthResponse,
  })
  handler(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
