import { PageView } from '@/analytics/page-view/domain/page-view';
import { PagePath } from '@/analytics/page-view/domain/page-path';
import { VisitorId } from '@/analytics/page-view/domain/visitor-id';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

export class PageViewMother {
  static random(
    overrides?: Partial<{
      path: string;
      visitorId: string;
      userId: string | null;
      referrer: string | null;
    }>,
  ): PageView {
    return PageView.record(
      new PagePath(overrides?.path ?? '/home'),
      new VisitorId(overrides?.visitorId ?? 'visitor-abc-123'),
      overrides?.userId !== undefined
        ? overrides.userId
          ? UserIdMother.withValue(overrides.userId)
          : null
        : null,
      overrides?.referrer ?? null,
    );
  }
}
