import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Registry, collectDefaultMetrics } from 'prom-client';
import { MetricsGetController } from '../controllers/metrics-get.controller';
import { SearchMetricsSummaryGetController } from '../controllers/search-metrics-summary-get.controller';
import { MetricsInterceptor } from './metrics.interceptor';
import { METRICS_REGISTRY } from '@/shared/domain/metrics-registry';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';
import { METRICS_SUMMARY_QUERY } from '@/observability/application/summary/metrics-summary.query';
import { PrometheusMetricsSummaryQuery } from '@/observability/infrastructure/prometheus-metrics-summary.query';
import { MetricsSummaryRetriever } from '@/observability/application/summary/metrics-summary-retriever';
import { PrometheusAppMetrics } from '@/shared/infrastructure/metrics/prometheus-app-metrics';
import { APP_METRICS } from '@/shared/domain/app-metrics';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [MetricsGetController, SearchMetricsSummaryGetController],
  providers: [
    {
      provide: METRICS_REGISTRY,
      useFactory: (): Registry => {
        const registry = new Registry();
        registry.setDefaultLabels({ app: 'ididntcatchthat-api' });
        collectDefaultMetrics({ register: registry });
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
    // App metrics (business counters)
    PrometheusAppMetrics,
    { provide: APP_METRICS, useExisting: PrometheusAppMetrics },
  ],
  exports: [METRICS_REGISTRY, APP_METRICS],
})
export class ObservabilityModule {}
