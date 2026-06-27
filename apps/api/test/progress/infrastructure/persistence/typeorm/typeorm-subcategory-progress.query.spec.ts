import { mock } from 'jest-mock-extended';
import { type DataSource } from 'typeorm';
import { TypeOrmSubcategoryProgressQuery } from '@/progress/infrastructure/persistence/typeorm/typeorm-subcategory-progress.query';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

describe('progress/infrastructure/persistence TypeOrmSubcategoryProgressQuery', () => {
  const dataSource = mock<DataSource>();
  let query: TypeOrmSubcategoryProgressQuery;

  beforeEach(() => {
    dataSource.query.mockReset();
    query = new TypeOrmSubcategoryProgressQuery(dataSource);
  });

  it('should aggregate progress by category and subcategory', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        category: 'native_sounds',
        subcategory: 't_soft_between_vowels',
        total_attempts: '10',
        correct_count: '7',
      },
    ]);

    const result = await query.findByUser(ProgressUserIdMother.random());

    expect(result).toEqual([
      {
        category: 'native_sounds',
        subcategory: 't_soft_between_vowels',
        totalAttempts: 10,
        correctCount: 7,
        accuracy: 0.7,
      },
    ]);
  });

  it('should filter groups with zero attempts', async () => {
    const userId = ProgressUserIdMother.random();
    dataSource.query.mockResolvedValueOnce([]);

    await query.findByUser(userId);

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('HAVING SUM(ufs.times_played) > 0'),
      [userId.value],
    );
  });
});
