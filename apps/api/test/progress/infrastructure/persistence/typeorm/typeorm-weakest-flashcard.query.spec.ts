import { mock } from 'jest-mock-extended';
import { type DataSource } from 'typeorm';
import { TypeOrmWeakestFlashcardQuery } from '@/progress/infrastructure/persistence/typeorm/typeorm-weakest-flashcard.query';
import { ProgressUserIdMother } from '@test/progress/domain/progress-user-id-mother';

describe('progress/infrastructure/persistence TypeOrmWeakestFlashcardQuery', () => {
  const dataSource = mock<DataSource>();
  let query: TypeOrmWeakestFlashcardQuery;

  beforeEach(() => {
    dataSource.query.mockReset();
    query = new TypeOrmWeakestFlashcardQuery(dataSource);
  });

  it('should return weakest flashcards with expression, category and subcategory', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        flashcard_id: 'fc-1',
        expression: 'gonna',
        category: 'connected_speech',
        subcategory: 'informal_going_to',
        error_count: 7,
        last_seen_at: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const result = await query.findWeakest(
      ProgressUserIdMother.random(),
      undefined,
      10,
      0,
    );

    expect(result).toEqual([
      {
        flashcardId: 'fc-1',
        expression: 'gonna',
        module: 'connected_speech',
        category: 'connected_speech',
        subcategory: 'informal_going_to',
        errorCount: 7,
        lastSeenAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('should filter played cards and use net errors (wrong - correct) so mastered cards drop out', async () => {
    const userId = ProgressUserIdMother.random();
    dataSource.query.mockResolvedValueOnce([]);

    await query.findWeakest(userId, undefined, 5, 0);

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('ufs.times_played > 0'),
      [userId.value, 5, 0],
    );
    // Net errors: cuando correct_count >= wrong_count la card sale de la lista
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('(ufs.times_played - 2*ufs.correct_count) > 0'),
      [userId.value, 5, 0],
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining(
        'ORDER BY (ufs.times_played - 2*ufs.correct_count) DESC',
      ),
      [userId.value, 5, 0],
    );
  });

  it('should pass limit and offset to the SQL query for pagination', async () => {
    const userId = ProgressUserIdMother.random();
    dataSource.query.mockResolvedValueOnce([]);

    await query.findWeakest(userId, undefined, 10, 20);

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('LIMIT $2 OFFSET $3'),
      [userId.value, 10, 20],
    );
  });

  it('should count weakest cards with the same net-errors filter as findWeakest', async () => {
    const userId = ProgressUserIdMother.random();
    dataSource.query.mockResolvedValueOnce([{ total: '42' }]);

    const total = await query.countWeakest(userId, undefined);

    expect(total).toBe(42);
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('(ufs.times_played - 2*ufs.correct_count) > 0'),
      [userId.value],
    );
  });
});
