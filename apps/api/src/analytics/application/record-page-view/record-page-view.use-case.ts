import { Inject, Injectable } from '@nestjs/common';
import { type PageViewRepository } from './page-view-repository';
import { ANALYTICS_TOKENS } from '@/analytics/infrastructure/framework/analytics.tokens';

export interface RecordPageViewCommand {
  path: string;
  visitorId: string;
  userId: string | null;
  referrer: string | null;
}

@Injectable()
export class RecordPageViewUseCase {
  constructor(
    @Inject(ANALYTICS_TOKENS.PAGE_VIEW_REPOSITORY)
    private readonly repository: PageViewRepository,
  ) {}

  async execute(command: RecordPageViewCommand): Promise<void> {
    await this.repository.save({
      path: command.path,
      visitorId: command.visitorId,
      userId: command.userId,
      referrer: command.referrer,
    });
  }
}
