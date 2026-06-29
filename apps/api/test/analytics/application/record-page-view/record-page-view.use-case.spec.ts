import { mock } from 'jest-mock-extended';
import { type PageViewRepository } from '@/analytics/domain/page-view.repository';
import { RecordPageViewUseCase } from '@/analytics/application/record-page-view/record-page-view.use-case';
import { PagePathInvalid } from '@/analytics/domain/errors/page-path-invalid';
import { VisitorIdInvalid } from '@/analytics/domain/errors/visitor-id-invalid';
describe('analytics/application/record-page-view RecordPageViewUseCase', () => {
  const repository = mock<PageViewRepository>();
  let useCase: RecordPageViewUseCase;

  beforeEach(() => {
    repository.save.mockReset();
    useCase = new RecordPageViewUseCase(repository);
  });

  it('should record a page view for an anonymous visitor', async () => {
    repository.save.mockResolvedValue(undefined);

    await useCase.execute({
      path: '/home',
      visitorId: 'vis-abc-123',
      userId: null,
      referrer: null,
    });

    expect(repository.save).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saved: any = repository.save.mock.calls[0][0];
    expect(saved.path.value).toBe('/home');
    expect(saved.visitorId.value).toBe('vis-abc-123');
    expect(saved.userId).toBeNull();
    expect(saved.referrer).toBeNull();
  });

  it('should record a page view for an authenticated user', async () => {
    repository.save.mockResolvedValue(undefined);
    const userId = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';

    await useCase.execute({
      path: '/backoffice/games',
      visitorId: 'vis-xyz-456',
      userId,
      referrer: 'https://google.com',
    });

    expect(repository.save).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saved: any = repository.save.mock.calls[0][0];
    expect(saved.path.value).toBe('/backoffice/games');
    expect(saved.userId?.value).toBe(userId);
    expect(saved.referrer).toBe('https://google.com');
  });

  it('should throw PagePathInvalid for an empty path', async () => {
    await expect(
      useCase.execute({
        path: '',
        visitorId: 'vis-abc-123',
        userId: null,
        referrer: null,
      }),
    ).rejects.toThrow(PagePathInvalid);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should throw VisitorIdInvalid for an empty visitor id', async () => {
    await expect(
      useCase.execute({
        path: '/home',
        visitorId: '',
        userId: null,
        referrer: null,
      }),
    ).rejects.toThrow(VisitorIdInvalid);

    expect(repository.save).not.toHaveBeenCalled();
  });
});
