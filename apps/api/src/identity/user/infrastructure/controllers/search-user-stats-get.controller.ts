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
import { apiEnvelopeSchema } from '@/shared/infrastructure/http/response/api-envelope.schema';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { UserStatsRetriever } from '@/identity/user/application/stats/user-stats-retriever';
import { type ResponseUserStatsRetriever } from '@/identity/user/application/stats/response-user-stats-retriever';
import { SearchUserStatsGetQuery } from './search-user-stats-get.query';

@ApiTags('identity')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SearchUserStatsGetController {
  constructor(private readonly retriever: UserStatsRetriever) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search user statistics for the backoffice',
    description:
      'Returns aggregated user registration, activity and engagement metrics for the selected period. Requires admin JWT.',
  })
  @ApiOkResponse({
    description: 'User statistics for the requested period',
    schema: apiEnvelopeSchema({
      period: '7d',
      totalUsers: 120,
      activeUsers: 45,
      engagementRate: 37.5,
    }),
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid period query parameter',
    type: ValidationErrorResponse,
  })
  async handler(
    @Query() query: SearchUserStatsGetQuery,
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseUserStatsRetriever>> {
    const data = await this.retriever.execute(query.period ?? '7d');
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
