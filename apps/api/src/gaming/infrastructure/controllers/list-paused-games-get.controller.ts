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
import { PausedGamesLister } from '@/gaming/application/list-paused/paused-games-lister';
import { type GamePrimitives } from '@/gaming/domain/game';

@ApiTags('games')
@Controller('games')
@UseGuards(JwtAuthGuard)
export class ListPausedGamesGetController {
  constructor(private readonly lister: PausedGamesLister) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handler(@CurrentUser() user: UserContext): Promise<GamePrimitives[]> {
    return this.lister.execute({ userId: user.userId! });
  }
}
