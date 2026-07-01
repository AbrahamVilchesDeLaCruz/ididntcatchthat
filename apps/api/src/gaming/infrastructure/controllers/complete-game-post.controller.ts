import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import {
  GameCompleter,
  type ResponseGameCompleter,
} from '@/gaming/application/complete/game-completer';

@ApiTags('gaming')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class CompleteGamePostController {
  constructor(private readonly completer: GameCompleter) {}

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete a game session',
    description:
      'Marks the game as completed and returns summary stats. Accepts JWT or guest token.',
  })
  @ApiOkResponse({ description: 'Game completed with summary stats' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ValidationErrorResponse,
  })
  async handler(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ): Promise<ResponseGameCompleter> {
    return this.completer.execute({
      gameId: id,
      userId: user.userId ?? null,
    });
  }
}
