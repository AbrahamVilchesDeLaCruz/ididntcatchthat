import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
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
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { CurrentUser } from '@/shared/infrastructure/auth/current-user.decorator';
import { type UserContext } from '@/shared/domain/user-context';
import { PaginatedApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { ValidationErrorResponse } from '@/shared/infrastructure/http/response/validation-error.response';
import { WeakestFlashcardSearcher } from '@/progress/application/search/weakest-flashcard-searcher';
import { type WeakestFlashcard } from '@/progress/domain/weakest-flashcard.query';
import { SearchWeakestFlashcardsGetQuery } from './search-weakest-flashcards-get.query';

@ApiTags('progress')
@ApiBearerAuth('access-token')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class SearchWeakestFlashcardsGetController {
  constructor(private readonly searcher: WeakestFlashcardSearcher) {}

  @Get('flashcards/weakest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search weakest flashcards for the current user (paginated)',
    description:
      'Returns flashcards with the highest net error count (wrong - correct), so cards the user is learning naturally drop out as correct answers accumulate. Supports pagination via page/pageSize query parameters (1-indexed).',
  })
  @ApiOkResponse({
    description: 'Paginated weakest flashcards list',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid page or pageSize query parameter',
    type: ValidationErrorResponse,
  })
  async handler(
    @CurrentUser() user: UserContext,
    @Query() query: SearchWeakestFlashcardsGetQuery,
    @Req() req: Request,
  ): Promise<PaginatedApiResponse<WeakestFlashcard>> {
    const page = await this.searcher.execute({
      userId: user.userId!,
      page: query.page,
      pageSize: query.pageSize,
    });
    return PaginatedApiResponse.of(
      page.data,
      {
        page: page.page,
        limit: page.pageSize,
        total_items: page.total,
        total_pages: page.totalPages,
        has_next_page: page.hasNextPage,
        has_prev_page: page.hasPrevPage,
      },
      resolveRequestId(req),
    );
  }
}
