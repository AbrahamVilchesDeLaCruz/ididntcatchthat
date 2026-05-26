import { Game } from '@/gaming/domain/game';
import { AttemptRecordedEvent } from '@/gaming/domain/events/attempt-recorded.event';
import { GameCompletedEvent } from '@/gaming/domain/events/game-completed.event';
import { GamePausedEvent } from '@/gaming/domain/events/game-paused.event';
import { GameAbandonedEvent } from '@/gaming/domain/events/game-abandoned.event';
import { FlashcardNotInGame } from '@/gaming/domain/exceptions/flashcard-not-in-game';
import { GameNotInProgress } from '@/gaming/domain/exceptions/game-not-in-progress';
import { GameNotPaused } from '@/gaming/domain/exceptions/game-not-paused';
import { GameNotFinished } from '@/gaming/domain/exceptions/game-not-finished';
import { GameAlreadyFinished } from '@/gaming/domain/exceptions/game-already-finished';

const flashcardIds = ['fc-1', 'fc-2', 'fc-3'];
const userId = '550e8400-e29b-41d4-a716-446655440000';

describe('Game.start', () => {
  it('should create a game in_progress with empty attempts', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    expect(game.status.value).toBe('in_progress');
    expect(game.userId).toBe(userId);
    expect(game.mode.value).toBe('study');
    expect(game.module?.value).toBe('native_sounds');
    expect(game.cardCount.value).toBe('10');
    expect(game.flashcardIds).toEqual(flashcardIds);
    expect(game.attempts).toHaveLength(0);
    expect(game.finishedAt).toBeNull();
    expect(game.pullDomainEvents()).toHaveLength(0);
  });

  it('should create a game with null userId (guest)', () => {
    const game = Game.start(null, 'game', null, '10', ['fc-1']);
    expect(game.userId).toBeNull();
    expect(game.module).toBeNull();
  });
});

describe('Game.recordAttempt', () => {
  it('should create attempt and emit AttemptRecordedEvent', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    game.recordAttempt('fc-1', true);
    expect(game.attempts).toHaveLength(1);
    expect(game.attempts[0].flashcardId).toBe('fc-1');
    expect(game.attempts[0].correct).toBe(true);
    const events = game.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(AttemptRecordedEvent);
  });

  it('should throw FlashcardNotInGame if flashcard does not belong to game', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    expect(() => game.recordAttempt('fc-not-in-game', true)).toThrow(
      FlashcardNotInGame,
    );
  });
});

describe('Game.pause', () => {
  it('should change status to paused and emit GamePausedEvent', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    game.pause('fc-1');
    expect(game.status.value).toBe('paused');
    expect(game.lastFlashcardId).toBe('fc-1');
    const events = game.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(GamePausedEvent);
  });

  it('should throw GameNotInProgress if game is not in progress', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    game.pause('fc-1');
    expect(() => game.pause('fc-2')).toThrow(GameNotInProgress);
  });
});

describe('Game.resume', () => {
  it('should change status to in_progress', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    game.pause('fc-1');
    game.pullDomainEvents(); // clear events
    game.resume();
    expect(game.status.value).toBe('in_progress');
  });

  it('should throw GameNotPaused if game is not paused', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    expect(() => game.resume()).toThrow(GameNotPaused);
  });
});

describe('Game.complete', () => {
  it('should change status to completed and emit GameCompletedEvent', () => {
    const game = Game.start(userId, 'study', 'native_sounds', '10', ['fc-1']);
    game.recordAttempt('fc-1', true);
    game.pullDomainEvents();
    game.complete();
    expect(game.status.value).toBe('completed');
    expect(game.finishedAt).toBeInstanceOf(Date);
    const events = game.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(GameCompletedEvent);
  });

  it('should throw GameNotFinished if there are pending flashcards', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    expect(() => game.complete()).toThrow(GameNotFinished);
  });
});

describe('Game.abandon', () => {
  it('should change status to abandoned and emit GameAbandonedEvent', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    game.abandon();
    expect(game.status.value).toBe('abandoned');
    const events = game.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(GameAbandonedEvent);
  });

  it('should throw GameAlreadyFinished if game is completed', () => {
    const game = Game.start(userId, 'study', 'native_sounds', '10', ['fc-1']);
    game.recordAttempt('fc-1', true);
    game.pullDomainEvents();
    game.complete();
    game.pullDomainEvents();
    expect(() => game.abandon()).toThrow(GameAlreadyFinished);
  });

  it('should throw GameAlreadyFinished if game is already abandoned', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    game.abandon();
    game.pullDomainEvents();
    expect(() => game.abandon()).toThrow(GameAlreadyFinished);
  });
});

describe('Game.pendingFlashcardIds', () => {
  it('should return flashcards without an attempt', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    game.recordAttempt('fc-1', true);
    game.pullDomainEvents();
    const pending = game.pendingFlashcardIds();
    expect(pending).toEqual(['fc-2', 'fc-3']);
  });

  it('should return all flashcards when no attempts recorded', () => {
    const game = Game.start(
      userId,
      'study',
      'native_sounds',
      '10',
      flashcardIds,
    );
    expect(game.pendingFlashcardIds()).toEqual(flashcardIds);
  });

  it('should return empty array when all flashcards have attempts', () => {
    const game = Game.start(userId, 'study', 'native_sounds', '10', ['fc-1']);
    game.recordAttempt('fc-1', false);
    game.pullDomainEvents();
    expect(game.pendingFlashcardIds()).toEqual([]);
  });
});

describe('Game.fromPrimitives', () => {
  it('should reconstruct game without emitting events', () => {
    const now = new Date();
    const game = Game.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId,
      mode: 'study',
      module: 'native_sounds',
      cardCount: '10',
      status: 'paused',
      flashcardIds: ['fc-1', 'fc-2'],
      lastFlashcardId: 'fc-1',
      startedAt: now,
      finishedAt: null,
      attempts: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          gameId: '550e8400-e29b-41d4-a716-446655440000',
          flashcardId: 'fc-1',
          correct: true,
          answeredAt: now,
        },
      ],
    });
    expect(game.status.value).toBe('paused');
    expect(game.attempts).toHaveLength(1);
    expect(game.pullDomainEvents()).toHaveLength(0);
  });
});

describe('Game.toPrimitives', () => {
  it('should serialize to primitives correctly', () => {
    const game = Game.start(userId, 'study', 'native_sounds', '10', ['fc-1']);
    const p = game.toPrimitives();
    expect(p.userId).toBe(userId);
    expect(p.mode).toBe('study');
    expect(p.module).toBe('native_sounds');
    expect(p.cardCount).toBe('10');
    expect(p.status).toBe('in_progress');
    expect(p.flashcardIds).toEqual(['fc-1']);
    expect(p.attempts).toHaveLength(0);
    expect(p.finishedAt).toBeNull();
  });
});
