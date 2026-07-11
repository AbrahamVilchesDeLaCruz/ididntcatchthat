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
      query,
      category,
      subcategory,
      audioStatus,
      page: rawPage,
      pageSize: rawPageSize,
    } = request;

    const page = rawPage ?? 1;
    const pageSize = rawPageSize ?? 20;
    const trimmedQuery = query?.trim() ?? '';
    const hasQuery = trimmedQuery.length > 0;

    if (!hasQuery) {
      return this.executeDbPaginated({
        category,
        subcategory,
        audioStatus,
        page,
        pageSize,
      });
    }

    return this.executeInMemoryTextSearch({
      query: trimmedQuery.toLowerCase(),
      category,
      subcategory,
      audioStatus,
      page,
      pageSize,
    });
  }

  private async executeDbPaginated(params: {
    category?: string;
    subcategory?: string;
    audioStatus?: string;
    page: number;
    pageSize: number;
  }): Promise<ResponseFlashcardSearcher> {
    const filters = this.buildFilters(params);

    const criteria = new Criteria(
      filters,
      null,
      params.pageSize,
      (params.page - 1) * params.pageSize,
    );

    const [flashcards, total] = await Promise.all([
      this.repository.match(criteria),
      this.repository.count(criteria),
    ]);

    return {
      data: flashcards.map((fc) => fc.toPrimitives()),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  private async executeInMemoryTextSearch(params: {
    query: string;
    category?: string;
    subcategory?: string;
    audioStatus?: string;
    page: number;
    pageSize: number;
  }): Promise<ResponseFlashcardSearcher> {
    const filters = this.buildFilters({
      category: params.category,
      subcategory: params.subcategory,
      audioStatus: params.audioStatus,
    });

    const criteria = new Criteria(filters, null, null, null);

    const all = await this.repository.match(criteria);

    const matching = all.filter((fc) => {
      const expression = fc.expression.value.toLowerCase();
      const meaning = fc.meaning.value.toLowerCase();
      return (
        expression.includes(params.query) || meaning.includes(params.query)
      );
    });

    const total = matching.length;
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageItems = matching.slice(start, end);

    return {
      data: pageItems.map((fc) => fc.toPrimitives()),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  private buildFilters(params: {
    category?: string;
    subcategory?: string;
    audioStatus?: string;
  }): Filter[] {
    const filters: Filter[] = [];

    if (params.category)
      filters.push({
        field: 'category',
        operator: FilterOperator.EQ,
        value: params.category,
      });
    if (params.subcategory)
      filters.push({
        field: 'subcategory',
        operator: FilterOperator.EQ,
        value: params.subcategory,
      });
    if (params.audioStatus)
      filters.push({
        field: 'audioStatus',
        operator: FilterOperator.EQ,
        value: params.audioStatus,
      });

    return filters;
  }
}
