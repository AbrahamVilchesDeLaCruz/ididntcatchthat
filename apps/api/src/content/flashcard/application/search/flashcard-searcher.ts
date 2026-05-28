import { Inject, Injectable } from '@nestjs/common';
import { type FlashcardPrimitives } from '@/content/flashcard/domain/flashcard';
import { Criteria, type Filter } from '@/shared/domain/criteria';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';

export type FlashcardSearchQuery = {
  category?: string;
  subcategory?: string;
  audioStatus?: string;
  page?: number;
  pageSize?: number;
};

export type FlashcardSearchResult = {
  data: FlashcardPrimitives[];
  total: number;
  page: number;
  pageSize: number;
};

@Injectable()
export class FlashcardSearcher {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
  ) {}

  async execute(query: FlashcardSearchQuery): Promise<FlashcardSearchResult> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const filters: Filter[] = [];

    if (query.category)
      filters.push({ field: 'category', operator: '=', value: query.category });
    if (query.subcategory)
      filters.push({
        field: 'subcategory',
        operator: '=',
        value: query.subcategory,
      });
    if (query.audioStatus)
      filters.push({
        field: 'audioStatus',
        operator: '=',
        value: query.audioStatus,
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
