import { describe, it, expect } from 'vitest';
import { mapPausedGame } from '../game.mapper';

describe('game.mapper mapPausedGame', () => {
  it('maps paused game primitives to view model', () => {
    const result = mapPausedGame({
      id: 'game-1',
      userId: 'user-1',
      mode: 'game',
      module: 'native_sounds',
      subcategory: 't_soft',
      cardCount: '10',
      status: 'paused',
      flashcardIds: ['fc-1'],
      lastFlashcardId: 'fc-1',
      startedAt: '2026-01-01T12:00:00.000Z',
      finishedAt: null,
      attempts: [],
    });

    expect(result).toEqual({
      gameId: 'game-1',
      module: 'native_sounds',
      subcategory: 't_soft',
      cardCount: 10,
      startedAt: new Date('2026-01-01T12:00:00.000Z'),
      lastFlashcardId: 'fc-1',
    });
  });
});
