import {
  Body,
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
import { AttemptRecorder } from '@/gaming/application/attempt/attempt-recorder';
import { RecordAttemptPostPayload } from './record-attempt-post.payload';

@ApiTags('games')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class RecordAttemptPostController {
  constructor(private readonly recorder: AttemptRecorder) {}

  @Post(':id/attempts')
  @HttpCode(HttpStatus.NO_CONTENT)
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
