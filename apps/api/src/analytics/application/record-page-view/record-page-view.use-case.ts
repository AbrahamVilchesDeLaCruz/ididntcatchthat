import { Inject, Injectable } from '@nestjs/common';
import { PageView } from '@/analytics/domain/page-view';
import { PagePath } from '@/analytics/domain/page-path';
import { VisitorId } from '@/analytics/domain/visitor-id';
import { UserId } from '@/shared/domain/user-id';
import { type PageViewRepository } from '@/analytics/domain/page-view.repository';
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
    const pageView = PageView.record(
      new PagePath(command.path),
      new VisitorId(command.visitorId),
      command.userId ? new UserId(command.userId) : null,
      command.referrer,
    );

    await this.repository.save(pageView);
  }
}
