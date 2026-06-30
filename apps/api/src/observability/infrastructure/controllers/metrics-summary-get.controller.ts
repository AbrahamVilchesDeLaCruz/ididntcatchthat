import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
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
  async handler(
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseMetricsSummaryRetriever>> {
    const data = await this.retriever.execute();
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
