import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { GameStarter } from '@/gaming/application/start/game-starter';
import { StartGamePostPayload } from './start-game-post.payload';

@ApiTags('games')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class StartGamePostController {
  constructor(private readonly starter: GameStarter) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handler(
    @Body() body: StartGamePostPayload,
    @CurrentUser() user: UserContext,
  ): Promise<{ gameId: string; flashcardIds: string[] }> {
    return this.starter.execute({
      userId: user.userId ?? null,
      mode: body.mode,
      module: body.module ?? null,
      subcategory: body.subcategory ?? null,
      cardCount: body.cardCount,
    });
  }
}
