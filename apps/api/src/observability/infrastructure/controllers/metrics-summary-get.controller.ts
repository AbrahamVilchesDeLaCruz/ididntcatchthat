import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Registry } from 'prom-client';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { METRICS_REGISTRY } from '@/observability/infrastructure/framework/metrics-registry.token';

export interface MetricSample {
  labels: Record<string, string>;
  value: number;
}

export interface MetricEntry {
  name: string;
  help: string;
  type: string;
  samples: MetricSample[];
}

export interface MetricsSummary {
  metrics: MetricEntry[];
}

@ApiTags('admin')
@Controller('admin/metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MetricsSummaryGetController {
  constructor(@Inject(METRICS_REGISTRY) private readonly registry: Registry) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async handler(): Promise<MetricsSummary> {
    const metricsJson = await this.registry.getMetricsAsJSON();

    const metrics: MetricEntry[] = metricsJson.map((metric) => ({
      name: metric.name,
      help: metric.help,
      type: metric.type as unknown as string,
      samples: (metric.values ?? []).map((v) => ({
        labels: (v.labels ?? {}) as Record<string, string>,
        value: v.value,
      })),
    }));

    return { metrics };
  }
}
