import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ValidationErrorSwagger } from '@/shared/infrastructure/http/response/validation-error.swagger';
import { GamePauser } from '@/gaming/application/pause/game-pauser';
import { GameAbandoner } from '@/gaming/application/abandon/game-abandoner';
import { PatchGamePayload } from './patch-game.payload';

@ApiTags('games')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(JwtAuthGuard)
export class PatchGamePatchController {
  constructor(
    private readonly pauser: GamePauser,
    private readonly abandoner: GameAbandoner,
  ) {}

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Pause or abandon a game session',
    description:
      'Updates game status to paused (requires lastFlashcardId) or abandoned. Requires authenticated user JWT.',
  })
  @ApiBody({ type: PatchGamePayload })
  @ApiNoContentResponse({ description: 'Game status updated' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid status or lastFlashcardId',
    type: ValidationErrorSwagger,
  })
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
