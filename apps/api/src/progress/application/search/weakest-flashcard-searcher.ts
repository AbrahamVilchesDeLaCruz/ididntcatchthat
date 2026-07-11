import { Inject, Injectable } from '@nestjs/common';
import {
  type WeakestFlashcard,
  type WeakestFlashcardQuery,
  WEAKEST_FLASHCARD_QUERY,
} from '../../domain/weakest-flashcard.query';
import { UserId } from '@/shared/domain/user-id';
import { type RequestWeakestFlashcardSearcher } from './request-weakest-flashcard-searcher';

export type { RequestWeakestFlashcardSearcher };

export interface WeakestFlashcardPage {
  data: WeakestFlashcard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

@Injectable()
export class WeakestFlashcardSearcher {
  constructor(
    @Inject(WEAKEST_FLASHCARD_QUERY)
    private readonly query: WeakestFlashcardQuery,
  ) {}

  async execute({
    userId,
    page,
    pageSize,
  }: RequestWeakestFlashcardSearcher): Promise<WeakestFlashcardPage> {
    const safePage = page ?? DEFAULT_PAGE;
    const cappedPageSize = Math.min(
      pageSize ?? DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    );
    const offset = (safePage - 1) * cappedPageSize;

    const [data, total] = await Promise.all([
      this.query.findWeakest(
        new UserId(userId),
        undefined,
        cappedPageSize,
        offset,
      ),
      this.query.countWeakest(new UserId(userId), undefined),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / cappedPageSize);

    return {
      data,
      total,
      page: safePage,
      pageSize: cappedPageSize,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    };
  }
}
