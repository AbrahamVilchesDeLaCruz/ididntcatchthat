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
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { AnalyticsSummaryRetriever } from '@/analytics/summary/application/analytics-summary-retriever';
import { type ResponseAnalyticsSummaryRetriever } from '@/analytics/summary/application/response-analytics-summary-retriever';
import { GetAnalyticsSummaryGetQuery } from './get-analytics-summary-get.query';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class GetAnalyticsSummaryGetController {
  constructor(private readonly retriever: AnalyticsSummaryRetriever) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get historical business analytics summary',
    description:
      'Returns aggregated page views, games, users and flashcards metrics for the selected period. ' +
      'Data is persisted in PostgreSQL (survives server restarts).',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Analytics summary for the requested period',
    schema: {
      type: 'object',
      required: ['data', 'meta'],
      properties: {
        data: {
          type: 'object',
          required: ['period', 'pageViews', 'games', 'users', 'flashcards'],
          properties: {
            period: {
              type: 'string',
              enum: ['24h', '7d', '15d', '30d', '6m', 'all'],
              example: '7d',
            },
            pageViews: { type: 'object' },
            games: { type: 'object' },
            users: { type: 'object' },
            flashcards: { type: 'object' },
          },
        },
        meta: {
          type: 'object',
          required: ['timestamp', 'request_id'],
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            request_id: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  async handler(
    @Query() query: GetAnalyticsSummaryGetQuery,
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseAnalyticsSummaryRetriever>> {
    const data = await this.retriever.execute(query.period ?? '7d');
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
