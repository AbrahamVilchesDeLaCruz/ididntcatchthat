import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Registry } from 'prom-client';
import { MetricsGetController } from '../controllers/metrics-get.controller';
import { MetricsInterceptor } from '../metrics.interceptor';

@Module({
  controllers: [MetricsGetController],
  providers: [
    {
      provide: Registry,
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
      inject: [Registry],
    },
  ],
  exports: [Registry],
})
export class ObservabilityModule {}
