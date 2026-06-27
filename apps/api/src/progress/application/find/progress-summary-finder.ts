import { Inject, Injectable } from '@nestjs/common';
import {
  type ProgressSummaryDto,
  type ProgressSummaryQuery,
  PROGRESS_SUMMARY_QUERY,
} from '@/progress/domain/progress-summary.query';
import { UserId } from '@/shared/domain/user-id';
import { type RequestProgressSummaryFinder } from './request-progress-summary-finder';

export type { RequestProgressSummaryFinder };

@Injectable()
export class ProgressSummaryFinder {
  constructor(
    @Inject(PROGRESS_SUMMARY_QUERY)
    private readonly query: ProgressSummaryQuery,
  ) {}

  async execute({
    userId,
  }: RequestProgressSummaryFinder): Promise<ProgressSummaryDto> {
    return this.query.findByUserId(new UserId(userId));
  }
}
