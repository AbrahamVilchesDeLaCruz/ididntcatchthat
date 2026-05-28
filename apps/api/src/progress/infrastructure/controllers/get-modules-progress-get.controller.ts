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
import { ModuleProgressFinder } from '@/progress/application/find/module-progress-finder';
import { type ModuleProgressPrimitives } from '@/progress/domain/module-progress';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class GetModulesProgressGetController {
  constructor(private readonly finder: ModuleProgressFinder) {}

  @Get('modules')
  @HttpCode(HttpStatus.OK)
  async handler(
    @CurrentUser() user: UserContext,
  ): Promise<{ data: ModuleProgressPrimitives[] }> {
    const data = await this.finder.execute({ userId: user.userId! });
    return { data };
  }
}
