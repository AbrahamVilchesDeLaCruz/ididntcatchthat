import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Request } from 'express';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { FlashcardCatalogQuerier } from '@/content/flashcard/application/catalog/flashcard-catalog-querier';
import { type ResponseFlashcardCatalogQuerier } from '@/content/flashcard/application/catalog/response-flashcard-catalog-querier';

@ApiTags('content')
@Controller('flashcards')
export class SearchFlashcardCatalogGetController {
  constructor(private readonly querier: FlashcardCatalogQuerier) {}

  @Get('catalog')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search flashcard catalog categories and subcategories',
    description:
      'Public endpoint returning the hierarchical catalog used by games and study flows. ' +
      'No authentication required.',
  })
  @ApiOkResponse({
    description: 'Flashcard catalog with localized labels and anchor examples',
  })
  handler(@Req() req: Request): ApiResponse<ResponseFlashcardCatalogQuerier> {
    const data = this.querier.execute();
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
