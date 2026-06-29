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
import { ViewRecorder } from '@/gaming/application/view/view-recorder';
import { RecordViewPostPayload } from './record-view-post.payload';

@ApiTags('games')
@Controller('games')
@UseGuards(AnyAuthGuard)
export class RecordViewPostController {
  constructor(private readonly recorder: ViewRecorder) {}

  @Post(':id/views')
  @HttpCode(HttpStatus.NO_CONTENT)
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
