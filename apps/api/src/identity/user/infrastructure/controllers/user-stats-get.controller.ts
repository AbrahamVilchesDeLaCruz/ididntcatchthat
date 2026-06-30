import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { UserStatsRetriever } from '@/identity/user/application/stats/user-stats-retriever';
import { type ResponseUserStatsRetriever } from '@/identity/user/application/stats/response-user-stats-retriever';
import { type UserStatPeriod } from '@/identity/user/application/stats/user-stats.query';

class UserStatsQueryParams {
  @IsOptional()
  @IsEnum(['24h', '7d', '15d', '30d', '6m', 'all'])
  period?: UserStatPeriod;
}

@ApiTags('admin')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UserStatsGetController {
  constructor(private readonly retriever: UserStatsRetriever) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async handler(
    @Query() query: UserStatsQueryParams,
    @Req() req: Request,
  ): Promise<ApiResponse<ResponseUserStatsRetriever>> {
    const data = await this.retriever.execute(query.period ?? '7d');
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
