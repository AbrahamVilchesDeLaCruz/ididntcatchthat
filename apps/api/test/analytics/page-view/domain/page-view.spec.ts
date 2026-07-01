import { PageView } from '@/analytics/page-view/domain/page-view';
import { PagePath } from '@/analytics/page-view/domain/page-path';
import { VisitorId } from '@/analytics/page-view/domain/visitor-id';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('analytics/page-view/domain PageView', () => {
  it('should record a page view with generated id and timestamp', () => {
    const pageView = PageView.record(
      new PagePath('/profile'),
      new VisitorId('vis-1'),
      null,
      null,
    );

    const primitives = pageView.toPrimitives();

    expect(primitives.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(primitives.path).toBe('/profile');
    expect(primitives.visitorId).toBe('vis-1');
    expect(primitives.userId).toBeNull();
    expect(primitives.recordedAt).toBeInstanceOf(Date);
  });

  it('should round-trip through fromPrimitives and toPrimitives', () => {
    const userId = UserIdMother.random().value;
    const recordedAt = new Date('2026-06-01T12:00:00.000Z');

    const pageView = PageView.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440000',
      path: '/backoffice',
      visitorId: 'vis-2',
      userId,
      referrer: 'https://example.com',
      recordedAt,
    });

    expect(pageView.toPrimitives()).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      path: '/backoffice',
      visitorId: 'vis-2',
      userId,
      referrer: 'https://example.com',
      recordedAt,
    });
  });
});
