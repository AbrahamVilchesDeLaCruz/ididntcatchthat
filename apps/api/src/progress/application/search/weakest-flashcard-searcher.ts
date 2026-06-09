import { Inject, Injectable } from '@nestjs/common';
import {
  type WeakestFlashcardDto,
  type WeakestFlashcardQuery,
  WEAKEST_FLASHCARD_QUERY,
} from '../../domain/weakest-flashcard.query';
import { UserId } from '@/shared/domain/user-id';
import { type RequestWeakestFlashcardSearcher } from './request-weakest-flashcard-searcher';

export type { RequestWeakestFlashcardSearcher };

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

@Injectable()
export class WeakestFlashcardSearcher {
  constructor(
    @Inject(WEAKEST_FLASHCARD_QUERY)
    private readonly query: WeakestFlashcardQuery,
  ) {}

  async execute({
    userId,
    limit,
  }: RequestWeakestFlashcardSearcher): Promise<WeakestFlashcardDto[]> {
    const cappedLimit = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    return this.query.findWeakest(new UserId(userId), cappedLimit);
  }
}
