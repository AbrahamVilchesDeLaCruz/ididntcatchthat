import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { WeakestFlashcardSearcher } from '@/progress/application/search/weakest-flashcard-searcher';
import { type UserFlashcardStatsPrimitives } from '@/progress/domain/user-flashcard-stats';
import { GetWeakestFlashcardsGetQuery } from './get-weakest-flashcards-get.query';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class GetWeakestFlashcardsGetController {
  constructor(private readonly searcher: WeakestFlashcardSearcher) {}

  @Get('flashcards/weakest')
  @HttpCode(HttpStatus.OK)
  async handler(
    @CurrentUser() user: UserContext,
    @Query() query: GetWeakestFlashcardsGetQuery,
  ): Promise<{ data: UserFlashcardStatsPrimitives[] }> {
    const data = await this.searcher.execute({
      userId: user.userId!,
      limit: query.limit,
    });
    return { data };
  }
}
