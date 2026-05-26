import { describe, it, expect } from 'vitest';
import { mapFlashcardForGame, mapGameSummary } from '../game.mapper';
import type {
  FlashcardGameApiModel,
  GameSummaryApiModel,
} from '../api/game.api-model';

describe('game/mapFlashcardForGame', () => {
  it('maps a flashcard api model with audio to a FlashcardGameVM', () => {
    const raw: FlashcardGameApiModel = {
      id: 'fc-1',
      position: 0,
      expression: 'gonna',
      meaning: 'Going to',
      ipaNotation: '/ˈɡɒnə/',
      nativeSpeech: null,
      audioUrls: {
        expression: {
          us: 'https://cdn/gonna-us.mp3',
          uk: 'https://cdn/gonna-uk.mp3',
          au: 'https://cdn/gonna-au.mp3',
        },
        examples: { us: 'https://cdn/ex-us.mp3' },
      },
      examples: [
        {
          id: 'ex-1',
          textEn: "I'm gonna be late.",
          textEs: 'Voy a llegar tarde.',
          position: 0,
        },
      ],
    };

    const vm = mapFlashcardForGame(raw);

    expect(vm.id).toBe('fc-1');
    expect(vm.expression).toBe('gonna');
    expect(vm.meaning).toBe('Going to');
    expect(vm.ipaNotation).toBe('/ˈɡɒnə/');
    expect(vm.audioUrls?.expression.us).toBe('https://cdn/gonna-us.mp3');
    expect(vm.examples).toHaveLength(1);
    expect(vm.examples[0].textEn).toBe("I'm gonna be late.");
  });

  it('maps a flashcard without audioUrls', () => {
    const raw: FlashcardGameApiModel = {
      id: 'fc-2',
      position: 1,
      expression: 'wanna',
      meaning: 'Want to',
      ipaNotation: null,
      nativeSpeech: null,
      audioUrls: null,
      examples: [],
    };

    const vm = mapFlashcardForGame(raw);

    expect(vm.audioUrls).toBeNull();
    expect(vm.examples).toHaveLength(0);
  });
});

describe('game/mapGameSummary', () => {
  it('maps a game summary api model to a GameSummaryVM', () => {
    const raw: GameSummaryApiModel = {
      correctCount: 8,
      totalCount: 10,
      accuracy: 0.8,
      duration: 120,
    };

    const vm = mapGameSummary(raw);

    expect(vm.correctCount).toBe(8);
    expect(vm.totalCount).toBe(10);
    expect(vm.accuracy).toBe(0.8);
    expect(vm.duration).toBe(120);
  });
});
