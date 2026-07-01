import { VisitorId } from '@/analytics/page-view/domain/visitor-id';
import { VisitorIdInvalid } from '@/analytics/page-view/domain/exceptions/visitor-id-invalid';

describe('analytics/page-view/domain VisitorId', () => {
  it('should accept a valid visitor id', () => {
    const visitorId = new VisitorId('visitor-abc-123');

    expect(visitorId.value).toBe('visitor-abc-123');
  });

  it('should throw VisitorIdInvalid for an empty visitor id', () => {
    expect(() => new VisitorId('')).toThrow(VisitorIdInvalid);
    expect(() => new VisitorId('   ')).toThrow(VisitorIdInvalid);
  });
});
