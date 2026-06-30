import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { type Request } from 'express';
import { JwtAuthGuard } from '@/shared/infrastructure/auth/jwt.guard';
import { RolesGuard } from '@/shared/infrastructure/auth/roles.guard';
import { Roles } from '@/shared/infrastructure/auth/roles.decorator';
import { PaginatedApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { FlashcardSearcher } from '@/content/flashcard/application/search/flashcard-searcher';
import { type FlashcardPrimitives } from '@/content/flashcard/domain/flashcard';
import { SearchFlashcardsGetQuery } from './search-flashcards-get.query';

@ApiTags('flashcards')
@Controller('flashcards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchFlashcardsGetController {
  constructor(private readonly searcher: FlashcardSearcher) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Search flashcards with pagination' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Paginated list of flashcards',
  })
  async handler(
    @Query() query: SearchFlashcardsGetQuery,
    @Req() req: Request,
  ): Promise<PaginatedApiResponse<FlashcardPrimitives>> {
    const result = await this.searcher.execute({
      category: query.category,
      subcategory: query.subcategory,
      audioStatus: query.audioStatus,
      page: query.page,
      pageSize: query.pageSize,
    });

    const limit = result.pageSize;
    const totalPages = Math.ceil(result.total / limit);

    return PaginatedApiResponse.of(
      result.data,
      {
        page: result.page,
        limit,
        total_items: result.total,
        total_pages: totalPages,
        has_next_page: result.page < totalPages,
        has_prev_page: result.page > 1,
      },
      resolveRequestId(req),
    );
  }
}
