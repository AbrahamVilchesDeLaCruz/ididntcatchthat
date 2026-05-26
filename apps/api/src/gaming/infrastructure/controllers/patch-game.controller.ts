import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { GamePauser } from '@/gaming/application/pause/game-pauser';
import { GameAbandoner } from '@/gaming/application/abandon/game-abandoner';
import { PatchGamePayload } from './patch-game.payload';

@ApiTags('games')
@Controller('games')
@UseGuards(JwtAuthGuard)
export class PatchGameController {
  constructor(
    private readonly pauser: GamePauser,
    private readonly abandoner: GameAbandoner,
  ) {}

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handler(
    @Param('id') id: string,
    @Body() body: PatchGamePayload,
    @CurrentUser() user: UserContext,
  ): Promise<void> {
    const userId = user.userId!;

    if (body.status === 'paused') {
      await this.pauser.execute({
        gameId: id,
        userId,
        lastFlashcardId: body.lastFlashcardId ?? '',
      });
    } else {
      await this.abandoner.execute({ gameId: id, userId });
    }
  }
}
