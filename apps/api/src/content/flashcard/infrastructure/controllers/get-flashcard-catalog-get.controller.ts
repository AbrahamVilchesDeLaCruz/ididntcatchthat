import { Controller, Get } from '@nestjs/common';
import { FlashcardCatalogQuerier } from '@/content/flashcard/application/catalog/flashcard-catalog-querier';
import { type ResponseFlashcardCatalogQuerier } from '@/content/flashcard/application/catalog/response-flashcard-catalog-querier';

@Controller('flashcards')
export class GetFlashcardCatalogGetController {
  constructor(private readonly querier: FlashcardCatalogQuerier) {}

  @Get('catalog')
  handler(): ResponseFlashcardCatalogQuerier {
    return this.querier.execute();
  }
}
