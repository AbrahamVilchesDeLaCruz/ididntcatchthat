import { Controller, Get, Inject, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { type Response } from 'express';
import { Registry } from 'prom-client';
import { METRICS_REGISTRY } from '@/observability/infrastructure/framework/metrics-registry.token';

@ApiExcludeController()
@Controller('metrics')
export class MetricsGetController {
  constructor(@Inject(METRICS_REGISTRY) private readonly registry: Registry) {}

  @Get()
  async handler(@Res() response: Response): Promise<void> {
    response.set('Content-Type', this.registry.contentType);
    response.end(await this.registry.metrics());
  }
}
