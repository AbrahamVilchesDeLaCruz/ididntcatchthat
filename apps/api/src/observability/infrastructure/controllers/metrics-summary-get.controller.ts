import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { MetricsSummaryRetriever } from '@/observability/application/summary/metrics-summary-retriever';
import { type ResponseMetricsSummaryRetriever } from '@/observability/application/summary/response-metrics-summary-retriever';

@ApiTags('admin')
@Controller('admin/metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MetricsSummaryGetController {
  constructor(private readonly retriever: MetricsSummaryRetriever) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async handler(): Promise<ResponseMetricsSummaryRetriever> {
    return this.retriever.execute();
  }
}
