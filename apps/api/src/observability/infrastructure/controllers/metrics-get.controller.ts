import { Controller, Get, Inject, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { type Response } from 'express';
import { Registry } from 'prom-client';
import { METRICS_REGISTRY } from '@/observability/infrastructure/framework/metrics-registry.token';

@ApiTags('observability')
@Controller('metrics')
export class MetricsGetController {
  constructor(@Inject(METRICS_REGISTRY) private readonly registry: Registry) {}

  @Get()
  @ApiOperation({
    summary: 'Prometheus metrics scrape endpoint',
    description:
      'Exposes application metrics in Prometheus text exposition format. Intended for Prometheus scrapers, not for the SPA.',
  })
  @ApiProduces('text/plain; version=0.0.4; charset=utf-8')
  @ApiOkResponse({
    description: 'Prometheus exposition format',
    schema: { type: 'string' },
  })
  async handler(@Res() response: Response): Promise<void> {
    response.set('Content-Type', this.registry.contentType);
    response.end(await this.registry.metrics());
  }
}
