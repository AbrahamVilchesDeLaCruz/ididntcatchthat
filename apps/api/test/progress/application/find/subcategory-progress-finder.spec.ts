import { mock } from 'jest-mock-extended';
import { SubcategoryProgressFinder } from '@/progress/application/find/subcategory-progress-finder';
import { type SubcategoryProgressQuery } from '@/progress/domain/subcategory-progress.query';
import { UserId } from '@/shared/domain/user-id';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

describe('progress/application/find SubcategoryProgressFinder', () => {
  const query = mock<SubcategoryProgressQuery>();
  let finder: SubcategoryProgressFinder;

  beforeEach(() => {
    query.findByUser.mockReset();
    finder = new SubcategoryProgressFinder(query);
  });

  it('should return subcategory progress from query', async () => {
    const userId = ProgressUserIdMother.random().value;
    const rows = [
      {
        category: 'native_sounds',
        subcategory: 'b_ball',
        totalAttempts: 10,
        correctCount: 7,
        accuracy: 0.7,
      },
    ];
    query.findByUser.mockResolvedValue(rows);

    const result = await finder.execute({ userId });

    expect(result).toEqual(rows);
    expect(query.findByUser).toHaveBeenCalledWith(new UserId(userId));
  });

  it('should return empty array when user has no progress', async () => {
    query.findByUser.mockResolvedValue([]);

    const result = await finder.execute({
      userId: ProgressUserIdMother.random().value,
    });

    expect(result).toEqual([]);
  });
});
