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

  it('should return weakest flashcards with expression and module', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        flashcard_id: 'fc-1',
        expression: 'gonna',
        module: 'connected_speech',
        error_count: 7,
        last_seen_at: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const result = await query.findWeakest(ProgressUserIdMother.random(), 10);

    expect(result).toEqual([
      {
        flashcardId: 'fc-1',
        expression: 'gonna',
        module: 'connected_speech',
        errorCount: 7,
        lastSeenAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('should query by user and limit ordered by lowest accuracy', async () => {
    const userId = ProgressUserIdMother.random();
    dataSource.query.mockResolvedValueOnce([]);

    await query.findWeakest(userId, 5);

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY ufs.accuracy_rate ASC'),
      [userId.value, 5],
    );
  });
});
