import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { GameStarter } from '@/gaming/application/start/game-starter';
import { StartGamePostPayload } from './start-game-post.payload';

@ApiTags('gaming')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class StartGamePostController {
  constructor(private readonly starter: GameStarter) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start a new game session',
    description:
      'Creates a game with the selected mode, module and card count. Accepts JWT or guest token.',
  })
  @ApiCreatedResponse({
    description: 'Game created with id and flashcard ids',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid mode, module or card count',
    type: ValidationErrorResponse,
  })
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
      source: body.source,
    });
  }
}
