import { Inject, Injectable } from '@nestjs/common';
import { UserId } from '@/shared/domain/user-id';
import {
  type SubcategoryProgress,
  type SubcategoryProgressQuery,
  SUBCATEGORY_PROGRESS_QUERY,
} from '@/progress/domain/subcategory-progress.query';

export type RequestSubcategoryProgressFinder = {
  userId: string;
};

@Injectable()
export class SubcategoryProgressFinder {
  constructor(
    @Inject(SUBCATEGORY_PROGRESS_QUERY)
    private readonly query: SubcategoryProgressQuery,
  ) {}

  async execute({
    userId,
  }: RequestSubcategoryProgressFinder): Promise<SubcategoryProgress[]> {
    return this.query.findByUser(new UserId(userId));
  }
}
