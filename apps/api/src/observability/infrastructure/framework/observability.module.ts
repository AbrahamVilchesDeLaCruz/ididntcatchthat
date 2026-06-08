import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Registry } from 'prom-client';
import { MetricsGetController } from '../controllers/metrics-get.controller';
import { MetricsSummaryGetController } from '../controllers/metrics-summary-get.controller';
import { MetricsInterceptor } from './metrics.interceptor';
import { METRICS_REGISTRY } from './metrics-registry.token';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';
import { METRICS_SUMMARY_QUERY } from '@/observability/application/summary/metrics-summary.query';
import { PrometheusMetricsSummaryQuery } from '@/observability/infrastructure/prometheus-metrics-summary.query';
import { MetricsSummaryRetriever } from '@/observability/application/summary/metrics-summary-retriever';

@Module({
  imports: [AuthModule],
  controllers: [MetricsGetController, MetricsSummaryGetController],
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
    // Queries
    { provide: METRICS_SUMMARY_QUERY, useClass: PrometheusMetricsSummaryQuery },
    // Use cases
    MetricsSummaryRetriever,
  ],
  exports: [METRICS_REGISTRY],
})
export class ObservabilityModule {}
