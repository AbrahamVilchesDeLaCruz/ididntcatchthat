import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
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
  ): Promise<{ data: ProgressSummaryDto }> {
    const data = await this.finder.execute({ userId: user.userId! });
    return { data };
  }
}
