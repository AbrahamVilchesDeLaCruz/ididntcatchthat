import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { UserId } from '@/shared/domain/user-id';
import { PageViewId } from './page-view-id';
import { PagePath } from './page-path';
import { VisitorId } from './visitor-id';

export type PageViewPrimitives = {
  id: string;
  path: string;
  visitorId: string;
  userId: string | null;
  referrer: string | null;
  recordedAt: Date;
};

export class PageView extends AggregateRoot<PageViewPrimitives> {
  private constructor(
    readonly id: PageViewId,
    readonly path: PagePath,
    readonly visitorId: VisitorId,
    readonly userId: UserId | null,
    readonly referrer: string | null,
    readonly recordedAt: Date,
  ) {
    super();
  }

  static record(
    path: PagePath,
    visitorId: VisitorId,
    userId: UserId | null,
    referrer: string | null,
  ): PageView {
    return new PageView(
      PageViewId.generate(),
      path,
      visitorId,
      userId,
      referrer,
      new Date(),
    );
  }

  static fromPrimitives(p: PageViewPrimitives): PageView {
    return new PageView(
      new PageViewId(p.id),
      new PagePath(p.path),
      new VisitorId(p.visitorId),
      p.userId ? new UserId(p.userId) : null,
      p.referrer,
      p.recordedAt,
    );
  }

  toPrimitives(): PageViewPrimitives {
    return {
      id: this.id.value,
      path: this.path.value,
      visitorId: this.visitorId.value,
      userId: this.userId?.value ?? null,
      referrer: this.referrer,
      recordedAt: this.recordedAt,
    };
  }
}
