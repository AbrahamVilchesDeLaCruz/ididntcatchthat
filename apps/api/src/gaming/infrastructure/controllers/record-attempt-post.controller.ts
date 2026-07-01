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
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AnyAuthGuard } from '@/shared/infrastructure/auth/any-auth.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { ValidationErrorSwagger } from '@/shared/infrastructure/http/response/validation-error.swagger';
import { AttemptRecorder } from '@/gaming/application/attempt/attempt-recorder';
import { RecordAttemptPostPayload } from './record-attempt-post.payload';

@ApiTags('games')
@ApiBearerAuth('access-token')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class RecordAttemptPostController {
  constructor(private readonly recorder: AttemptRecorder) {}

  @Post(':id/attempts')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Record a flashcard attempt in a game',
    description:
      'Persists whether the user answered a flashcard correctly. Accepts JWT or guest token.',
  })
  @ApiBody({ type: RecordAttemptPostPayload })
  @ApiNoContentResponse({ description: 'Attempt recorded' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid flashcardId or correct flag',
    type: ValidationErrorSwagger,
  })
  async handler(
    @Param('id') id: string,
    @Body() body: RecordAttemptPostPayload,
    @CurrentUser() user: UserContext,
  ): Promise<void> {
    await this.recorder.execute({
      gameId: id,
      flashcardId: body.flashcardId,
      correct: body.correct,
      userId: user.userId ?? null,
    });
  }
}
