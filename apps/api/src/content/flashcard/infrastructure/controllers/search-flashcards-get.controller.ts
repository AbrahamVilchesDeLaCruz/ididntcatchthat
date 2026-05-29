import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { FlashcardSearcher } from '@/content/flashcard/application/search/flashcard-searcher';
import { type ResponseFlashcardSearcher } from '@/content/flashcard/application/search/response-flashcard-searcher';
import { SearchFlashcardsGetQuery } from './search-flashcards-get.query';

@ApiTags('flashcards')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchFlashcardsGetController {
  constructor(private readonly searcher: FlashcardSearcher) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Search flashcards with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of flashcards' })
  async handler(
    @Query() query: SearchFlashcardsGetQuery,
  ): Promise<ResponseFlashcardSearcher> {
    return this.searcher.execute({
      category: query.category,
      subcategory: query.subcategory,
      audioStatus: query.audioStatus,
      page: query.page,
      pageSize: query.pageSize,
    });
  }
}
