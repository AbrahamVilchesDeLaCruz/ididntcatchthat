import { Controller, Get } from '@nestjs/common';
import {
  FlashcardCatalogQuerier,
  type FlashcardCatalog,
} from '@/content/flashcard/application/catalog/flashcard-catalog-querier';

@Controller('flashcards')
export class GetFlashcardCatalogGetController {
  constructor(private readonly querier: FlashcardCatalogQuerier) {}

  @Get('catalog')
  handler(): FlashcardCatalog {
    const result: FlashcardCatalog = this.querier.execute();
    return result;
  }
}
