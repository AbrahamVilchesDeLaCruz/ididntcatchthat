import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { MetricsSummaryRetriever } from '@/observability/application/summary/metrics-summary-retriever';
import { type ResponseMetricsSummaryRetriever } from '@/observability/application/summary/response-metrics-summary-retriever';
import { SearchMetricsSummaryEnvelopeSwagger } from './search-metrics-summary-get.swagger';

@ApiTags('observability')
@ApiBearerAuth('access-token')
@Controller('admin/metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SearchMetricsSummaryGetController {
  constructor(private readonly retriever: MetricsSummaryRetriever) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search Prometheus metrics summary',
    description:
      'Returns a JSON summary of registered Prometheus metrics for the backoffice observability dashboard. Requires admin JWT.',
  })
  @ApiOkResponse({
    description: 'Prometheus metrics summary',
    type: SearchMetricsSummaryEnvelopeSwagger,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async handler(
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseMetricsSummaryRetriever>> {
    const data = await this.retriever.execute();
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
