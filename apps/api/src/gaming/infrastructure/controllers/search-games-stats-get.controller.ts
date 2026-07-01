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
import { GameStatsRetriever } from '@/gaming/application/stats/game-stats-retriever';
import { type ResponseGameStatsRetriever } from '@/gaming/application/stats/response-game-stats-retriever';
import { SearchGamesStatsGetQuery } from './search-games-stats-get.query';

@ApiTags('games')
@ApiBearerAuth('access-token')
@Controller('admin/games')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class SearchGamesStatsGetController {
  constructor(private readonly retriever: GameStatsRetriever) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search aggregated game statistics',
    description:
      'Returns game metrics (totals, completion rate, accuracy, breakdowns by module/mode/period) for the selected time window. Requires admin or teacher JWT.',
  })
  @ApiOkResponse({ description: 'Game statistics for the requested period' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Admin or teacher role required' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid period query parameter',
    type: ValidationErrorSwagger,
  })
  async handler(
    @Query() query: SearchGamesStatsGetQuery,
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseGameStatsRetriever>> {
    const data = await this.retriever.execute(query.period ?? '7d');
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
