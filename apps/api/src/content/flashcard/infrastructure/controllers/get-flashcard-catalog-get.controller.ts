import { Controller, Get, Req } from '@nestjs/common';
import { type Request } from 'express';
import { ApiResponse } from '@/shared/infrastructure/http/response/api-response';
import { resolveRequestId } from '@/shared/infrastructure/http/resolve-request-id';
import { FlashcardCatalogQuerier } from '@/content/flashcard/application/catalog/flashcard-catalog-querier';
import { type ResponseFlashcardCatalogQuerier } from '@/content/flashcard/application/catalog/response-flashcard-catalog-querier';

@Controller('flashcards')
export class GetFlashcardCatalogGetController {
  constructor(private readonly querier: FlashcardCatalogQuerier) {}

  @Get('catalog')
  handler(@Req() req: Request): ApiResponse<ResponseFlashcardCatalogQuerier> {
    const data = this.querier.execute();
    return ApiResponse.of(data, resolveRequestId(req));
  }
}
