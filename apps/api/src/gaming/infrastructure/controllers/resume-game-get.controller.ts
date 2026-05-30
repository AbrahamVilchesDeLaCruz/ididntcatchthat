import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import {
  GameResumer,
  type ResponseGameResumer,
} from '@/gaming/application/resume/game-resumer';

@ApiTags('games')
@Controller('games')
@UseGuards(JwtAuthGuard)
export class ResumeGameGetController {
  constructor(private readonly resumer: GameResumer) {}

  @Get(':id/resume')
  @HttpCode(HttpStatus.OK)
  async handler(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ): Promise<ResponseGameResumer> {
    return this.resumer.execute({ gameId: id, userId: user.userId! });
  }
}
