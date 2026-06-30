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
import { ProgressSummaryFinder } from '@/progress/application/find/progress-summary-finder';
import { type ProgressSummaryDto } from '@/progress/domain/progress-summary.query';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class GetProgressSummaryGetController {
  constructor(private readonly finder: ProgressSummaryFinder) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async handler(
    @CurrentUser() user: UserContext,
    @Req() req: Request,
  ): Promise<ApiResponse<ProgressSummaryDto>> {
    const data = await this.finder.execute({ userId: user.userId! });
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
