import { afterEach, describe, expect, it } from 'vitest';
import {
  clearGameSummary,
  readGameSummary,
  resolveGameSummary,
  saveGameSummary,
} from '../game-summary.storage';
import type { GameSummaryVM } from '../game.types';

const summary: GameSummaryVM = {
  correctCount: 8,
  totalCount: 10,
  accuracy: 0.8,
  duration: 120,
};

afterEach(() => {
  clearGameSummary('game-1');
});

describe('game-summary.storage', () => {
  it('persists and reads a summary by game id', () => {
    saveGameSummary('game-1', summary);

    expect(readGameSummary('game-1')).toEqual(summary);
  });

  it('resolveGameSummary prefers navigation state over storage', () => {
    saveGameSummary('game-1', summary);
    const fromNav: GameSummaryVM = {
      correctCount: 5,
      totalCount: 10,
      accuracy: 0.5,
      duration: 60,
    };

    expect(resolveGameSummary('game-1', fromNav)).toEqual(fromNav);
  });

  it('resolveGameSummary falls back to storage when navigation state is missing', () => {
    saveGameSummary('game-1', summary);

    expect(resolveGameSummary('game-1', undefined)).toEqual(summary);
  });

  it('resolveGameSummary returns empty summary when nothing is stored', () => {
    expect(resolveGameSummary('game-1', undefined)).toEqual({
      correctCount: 0,
      totalCount: 0,
      accuracy: 0,
      duration: 0,
    });
  });
});
