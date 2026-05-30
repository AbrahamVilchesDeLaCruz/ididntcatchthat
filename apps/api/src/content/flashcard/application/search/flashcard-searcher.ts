import { Inject, Injectable } from '@nestjs/common';
import {
  Criteria,
  FilterOperator,
  type Filter,
} from '@/shared/domain/criteria';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import { type RequestFlashcardSearcher } from './request-flashcard-searcher';
import { type ResponseFlashcardSearcher } from './response-flashcard-searcher';

export type { RequestFlashcardSearcher } from './request-flashcard-searcher';
export type { ResponseFlashcardSearcher } from './response-flashcard-searcher';

@Injectable()
export class FlashcardSearcher {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
  ) {}

  async execute(
    request: RequestFlashcardSearcher,
  ): Promise<ResponseFlashcardSearcher> {
    const {
      category,
      subcategory,
      audioStatus,
      page: rawPage,
      pageSize: rawPageSize,
    } = request;

    const page = rawPage ?? 1;
    const pageSize = rawPageSize ?? 20;

    const filters: Filter[] = [];

    if (category)
      filters.push({
        field: 'category',
        operator: FilterOperator.EQ,
        value: category,
      });
    if (subcategory)
      filters.push({
        field: 'subcategory',
        operator: FilterOperator.EQ,
        value: subcategory,
      });
    if (audioStatus)
      filters.push({
        field: 'audioStatus',
        operator: FilterOperator.EQ,
        value: audioStatus,
      });

    const criteria = new Criteria(
      filters,
      null,
      pageSize,
      (page - 1) * pageSize,
    );

    const [flashcards, total] = await Promise.all([
      this.repository.match(criteria),
      this.repository.count(criteria),
    ]);

    return {
      data: flashcards.map((fc) => fc.toPrimitives()),
      total,
      page,
      pageSize,
    };
  }
}
