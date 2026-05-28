import { Attempt } from '@/gaming/domain/attempt';

describe('Attempt', () => {
  it('should create an attempt with generated id', () => {
    const attempt = Attempt.create('game-id-1', 'flashcard-id-1', true);
    expect(attempt.id).toBeDefined();
    expect(attempt.gameId).toBe('game-id-1');
    expect(attempt.flashcardId).toBe('flashcard-id-1');
    expect(attempt.correct).toBe(true);
    expect(attempt.answeredAt).toBeInstanceOf(Date);
  });

  it('should generate unique ids', () => {
    const a1 = Attempt.create('game-1', 'fc-1', true);
    const a2 = Attempt.create('game-1', 'fc-1', true);
    expect(a1.id).not.toBe(a2.id);
  });

  it('should reconstruct from primitives without side effects', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const primitives = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      gameId: 'game-1',
      flashcardId: 'fc-1',
      correct: false,
      answeredAt: now,
    };
    const attempt = Attempt.fromPrimitives(primitives);
    expect(attempt.id).toBe(primitives.id);
    expect(attempt.gameId).toBe(primitives.gameId);
    expect(attempt.flashcardId).toBe(primitives.flashcardId);
    expect(attempt.correct).toBe(false);
    expect(attempt.answeredAt).toEqual(now);
  });

  it('should serialize toPrimitives correctly', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const attempt = Attempt.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440002',
      gameId: 'game-2',
      flashcardId: 'fc-2',
      correct: true,
      answeredAt: now,
    });
    const primitives = attempt.toPrimitives();
    expect(primitives.id).toBe('550e8400-e29b-41d4-a716-446655440002');
    expect(primitives.gameId).toBe('game-2');
    expect(primitives.correct).toBe(true);
    expect(primitives.answeredAt).toEqual(now);
  });
});
