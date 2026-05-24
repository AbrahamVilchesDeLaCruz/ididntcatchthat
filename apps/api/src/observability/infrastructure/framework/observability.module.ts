import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Registry } from 'prom-client';
import { MetricsGetController } from '../controllers/metrics-get.controller';
import { MetricsInterceptor } from './metrics.interceptor';
import { METRICS_REGISTRY } from './metrics-registry.token';

@Module({
  controllers: [MetricsGetController],
  providers: [
    {
      provide: METRICS_REGISTRY,
      useFactory: (): Registry => {
        const registry = new Registry();
        registry.setDefaultLabels({ app: 'ididntcatchthat-api' });
        return registry;
      },
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (registry: Registry): MetricsInterceptor =>
        new MetricsInterceptor(registry),
      inject: [METRICS_REGISTRY],
    },
  ],
  exports: [METRICS_REGISTRY],
})
export class ObservabilityModule {}
