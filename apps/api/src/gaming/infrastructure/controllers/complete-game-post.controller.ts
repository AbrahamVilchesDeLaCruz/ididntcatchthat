import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import {
  GameCompleter,
  type GameSummary,
} from '@/gaming/application/complete/game-completer';

@ApiTags('games')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class CompleteGamePostController {
  constructor(private readonly completer: GameCompleter) {}

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async handler(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ): Promise<GameSummary> {
    return this.completer.execute({
      gameId: id,
      userId: user.userId ?? null,
    });
  }
}
