import { type RequestPageViewRecorder } from '@/analytics/page-view/application/request-page-view-recorder';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

export class RequestPageViewRecorderMother {
  static random(
    overrides?: Partial<RequestPageViewRecorder>,
  ): RequestPageViewRecorder {
    return {
      path: overrides?.path ?? '/games',
      visitorId: overrides?.visitorId ?? 'visitor-xyz-456',
      userId: overrides?.userId ?? null,
      referrer: overrides?.referrer ?? null,
    };
  }

  static authenticated(userId?: string): RequestPageViewRecorder {
    return RequestPageViewRecorderMother.random({
      userId: userId ?? UserIdMother.random().value,
      referrer: 'https://google.com',
    });
  }
}
