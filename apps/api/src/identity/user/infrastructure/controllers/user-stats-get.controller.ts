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
import { UserStatsRetriever } from '@/identity/user/application/stats/user-stats-retriever';
import { type ResponseUserStatsRetriever } from '@/identity/user/application/stats/response-user-stats-retriever';

@ApiTags('admin')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UserStatsGetController {
  constructor(private readonly retriever: UserStatsRetriever) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async handler(): Promise<ResponseUserStatsRetriever> {
    return this.retriever.execute();
  }
}
