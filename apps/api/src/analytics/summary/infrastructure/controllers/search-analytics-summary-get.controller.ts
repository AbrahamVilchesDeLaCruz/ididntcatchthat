import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ValidationErrorSwagger } from '@/shared/infrastructure/http/response/validation-error.swagger';
import { AnalyticsSummaryRetriever } from '@/analytics/summary/application/analytics-summary-retriever';
import { type ResponseAnalyticsSummaryRetriever } from '@/analytics/summary/application/response-analytics-summary-retriever';
import { SearchAnalyticsSummaryGetQuery } from './search-analytics-summary-get.query';
import { SearchAnalyticsSummaryEnvelopeSwagger } from './search-analytics-summary-get.swagger';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SearchAnalyticsSummaryGetController {
  constructor(private readonly retriever: AnalyticsSummaryRetriever) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search historical business analytics summary',
    description:
      'Returns aggregated page views, games, users and flashcards metrics for the selected period. ' +
      'Data is persisted in PostgreSQL (survives server restarts). Requires admin JWT.',
  })
  @ApiOkResponse({
    description: 'Analytics summary for the requested period',
    type: SearchAnalyticsSummaryEnvelopeSwagger,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid period query parameter',
    type: ValidationErrorSwagger,
  })
  async handler(
    @Query() query: SearchAnalyticsSummaryGetQuery,
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseAnalyticsSummaryRetriever>> {
    const data = await this.retriever.execute(query.period ?? '7d');
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
