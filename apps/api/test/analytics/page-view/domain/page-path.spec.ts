import { PagePath } from '@/analytics/page-view/domain/page-path';
import { PagePathInvalid } from '@/analytics/page-view/domain/exceptions/page-path-invalid';

describe('analytics/page-view/domain PagePath', () => {
  it('should accept a valid path', () => {
    const path = new PagePath('/games');

    expect(path.value).toBe('/games');
  });

  it('should throw PagePathInvalid for an empty path', () => {
    expect(() => new PagePath('')).toThrow(PagePathInvalid);
    expect(() => new PagePath('   ')).toThrow(PagePathInvalid);
  });
});
