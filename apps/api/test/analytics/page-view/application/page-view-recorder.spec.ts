import { mock } from 'jest-mock-extended';
import { type PageViewRepository } from '@/analytics/page-view/domain/page-view.repository';
import { PageViewRecorder } from '@/analytics/page-view/application/page-view-recorder';
import { PagePathInvalid } from '@/analytics/page-view/domain/exceptions/page-path-invalid';
import { VisitorIdInvalid } from '@/analytics/page-view/domain/exceptions/visitor-id-invalid';
import { type Logger } from '@/shared/domain/logger';
import { RequestPageViewRecorderMother } from '@test/analytics/page-view/domain/request-page-view-recorder-mother';
import { PageViewMother } from '@test/analytics/page-view/domain/page-view-mother';

describe('analytics/page-view/application PageViewRecorder', () => {
  const repository = mock<PageViewRepository>();
  const logger = mock<Logger>();
  let recorder: PageViewRecorder;

  beforeEach(() => {
    repository.save.mockReset();
    logger.info.mockReset();
    recorder = new PageViewRecorder(repository, logger);
  });

  it('should record a page view for an anonymous visitor', async () => {
    repository.save.mockResolvedValue(undefined);
    const request = RequestPageViewRecorderMother.random({
      path: '/home',
      visitorId: 'vis-abc-123',
    });

    await recorder.execute(request);

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.toPrimitives().path).toBe('/home');
    expect(saved.toPrimitives().visitorId).toBe('vis-abc-123');
    expect(saved.toPrimitives().userId).toBeNull();
    expect(logger.info).toHaveBeenCalledWith('Page view recorded', {
      path: '/home',
      visitorId: 'vis-abc-123',
      hasUserId: false,
    });
  });

  it('should record a page view for an authenticated user', async () => {
    repository.save.mockResolvedValue(undefined);
    const request = RequestPageViewRecorderMother.authenticated();

    await recorder.execute(request);

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.toPrimitives().userId).toBe(request.userId);
    expect(saved.toPrimitives().referrer).toBe('https://google.com');
    expect(logger.info).toHaveBeenCalledWith(
      'Page view recorded',
      expect.objectContaining({ hasUserId: true }),
    );
  });

  it('should throw PagePathInvalid for an empty path', async () => {
    await expect(
      recorder.execute(
        RequestPageViewRecorderMother.random({ path: '', visitorId: 'vis-1' }),
      ),
    ).rejects.toThrow(PagePathInvalid);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should throw VisitorIdInvalid for an empty visitor id', async () => {
    await expect(
      recorder.execute(
        RequestPageViewRecorderMother.random({ path: '/home', visitorId: '' }),
      ),
    ).rejects.toThrow(VisitorIdInvalid);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should persist aggregate built from mothers equivalently', async () => {
    repository.save.mockResolvedValue(undefined);
    const expected = PageViewMother.random();

    await recorder.execute({
      path: expected.toPrimitives().path,
      visitorId: expected.toPrimitives().visitorId,
      userId: expected.toPrimitives().userId,
      referrer: expected.toPrimitives().referrer,
    });

    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
