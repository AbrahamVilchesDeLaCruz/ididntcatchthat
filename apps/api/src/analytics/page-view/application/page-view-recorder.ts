import { Inject, Injectable } from '@nestjs/common';
import { PageView } from '@/analytics/page-view/domain/page-view';
import { PagePath } from '@/analytics/page-view/domain/page-path';
import { VisitorId } from '@/analytics/page-view/domain/visitor-id';
import { UserId } from '@/shared/domain/user-id';
import {
  type PageViewRepository,
  PAGE_VIEW_REPOSITORY,
} from '@/analytics/page-view/domain/page-view.repository';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestPageViewRecorder } from './request-page-view-recorder';

@Injectable()
export class PageViewRecorder {
  constructor(
    @Inject(PAGE_VIEW_REPOSITORY)
    private readonly repository: PageViewRepository,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestPageViewRecorder): Promise<void> {
    const pageView = PageView.record(
      new PagePath(request.path),
      new VisitorId(request.visitorId),
      request.userId ? new UserId(request.userId) : null,
      request.referrer,
    );

    await this.repository.save(pageView);

    this.logger.info('Page view recorded', {
      path: request.path,
      visitorId: request.visitorId,
      hasUserId: request.userId !== null,
    });
  }
}
