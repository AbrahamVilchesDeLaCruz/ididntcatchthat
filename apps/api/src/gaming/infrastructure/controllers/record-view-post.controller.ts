import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { ViewRecorder } from '@/gaming/application/view/view-recorder';
import { RecordViewPostPayload } from './record-view-post.payload';

@ApiTags('gaming')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class RecordViewPostController {
  constructor(private readonly recorder: ViewRecorder) {}

  @Post(':id/views')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Record a flashcard view in a game',
    description:
      'Persists that the user viewed a flashcard during a game session. Accepts JWT or guest token.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid flashcardId',
    type: ValidationErrorResponse,
  })
  async handler(
    @Param('id') id: string,
    @Body() body: RecordViewPostPayload,
    @CurrentUser() user: UserContext,
  ): Promise<void> {
    await this.recorder.execute({
      gameId: id,
      flashcardId: body.flashcardId,
      userId: user.userId ?? null,
    });
  }
}
