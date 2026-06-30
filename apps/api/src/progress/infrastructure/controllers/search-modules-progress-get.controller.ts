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
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ModuleProgressFinder } from '@/progress/application/find/module-progress-finder';
import { type ModuleProgressWithStudyPrimitives } from '@/progress/domain/module-progress';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class SearchModulesProgressGetController {
  constructor(private readonly finder: ModuleProgressFinder) {}

  @Get('modules')
  @HttpCode(HttpStatus.OK)
  async handler(
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<ModuleProgressWithStudyPrimitives[]>> {
    const data = await this.finder.execute({ userId: user.userId! });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
