import { describe, it, expect } from 'vitest';
import { mapFlashcard, mapFlashcardsPage } from '../flashcards.mapper';
import type {
  FlashcardApiModel,
  FlashcardsListApiModel,
} from '../api/flashcards.api-model';

// ─── Object Mother ────────────────────────────────────────────────────────────

class FlashcardApiModelMother {
  static create(overrides?: Partial<FlashcardApiModel>): FlashcardApiModel {
    return {
      id: 'fc-001',
      expression: 'gonna',
      meaning: 'going to — forma reducida',
      category: 'connected_speech',
      subcategory: 'informal_going_to',
      ipaNotation: 'ˈɡɒnə',
      nativeSpeech: 'gonna',
      audioStatus: 'ready',
      audioUrls: null,
      examples: [
        {
          id: 'ex-001',
          textEn: "I'm gonna call you.",
          textEs: 'Te voy a llamar.',
          position: 1,
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
      ...overrides,
    };
  }

  static withNullOptionals(): FlashcardApiModel {
    return FlashcardApiModelMother.create({
      ipaNotation: null,
      nativeSpeech: null,
      examples: [],
    });
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('flashcards.mapper', () => {
  describe('mapFlashcard', () => {
    it('mapea todos los campos escalares correctamente', () => {
      const raw = FlashcardApiModelMother.create();

      const vm = mapFlashcard(raw);

      expect(vm.id).toBe('fc-001');
      expect(vm.expression).toBe('gonna');
      expect(vm.meaning).toBe('going to — forma reducida');
      expect(vm.category).toBe('connected_speech');
      expect(vm.subcategory).toBe('informal_going_to');
      expect(vm.ipaNotation).toBe('ˈɡɒnə');
      expect(vm.nativeSpeech).toBe('gonna');
      expect(vm.audioStatus).toBe('ready');
    });

    it('convierte createdAt y updatedAt a instancias de Date', () => {
      const raw = FlashcardApiModelMother.create();

      const vm = mapFlashcard(raw);

      expect(vm.createdAt).toBeInstanceOf(Date);
      expect(vm.updatedAt).toBeInstanceOf(Date);
      expect(vm.createdAt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(vm.updatedAt.toISOString()).toBe('2026-06-01T00:00:00.000Z');
    });

    it('mapea los ejemplos preservando todos sus campos', () => {
      const raw = FlashcardApiModelMother.create();

      const vm = mapFlashcard(raw);

      expect(vm.examples).toHaveLength(1);
      expect(vm.examples[0]).toEqual({
        id: 'ex-001',
        textEn: "I'm gonna call you.",
        textEs: 'Te voy a llamar.',
        position: 1,
      });
    });

    it('preserva null en ipaNotation y nativeSpeech cuando la API los devuelve null', () => {
      const raw = FlashcardApiModelMother.withNullOptionals();

      const vm = mapFlashcard(raw);

      expect(vm.ipaNotation).toBeNull();
      expect(vm.nativeSpeech).toBeNull();
    });

    it('devuelve array vacío de ejemplos cuando la API no envía ninguno', () => {
      const raw = FlashcardApiModelMother.withNullOptionals();

      const vm = mapFlashcard(raw);

      expect(vm.examples).toEqual([]);
    });

    it('mapea todos los valores de audioStatus', () => {
      const statuses = ['pending', 'generating', 'ready', 'failed'] as const;

      statuses.forEach((status) => {
        const raw = FlashcardApiModelMother.create({ audioStatus: status });
        const vm = mapFlashcard(raw);
        expect(vm.audioStatus).toBe(status);
      });
    });

    it('mapea audioUrls cuando la API los devuelve', () => {
      const raw = FlashcardApiModelMother.create({
        audioUrls: {
          expression: {
            us: 'https://cdn/us.mp3',
            uk: 'https://cdn/uk.mp3',
            au: 'https://cdn/au.mp3',
          },
          examples: { us: 'https://cdn/ex-us.mp3' },
        },
      });

      const vm = mapFlashcard(raw);

      expect(vm.audioUrls).toEqual({
        expression: {
          us: 'https://cdn/us.mp3',
          uk: 'https://cdn/uk.mp3',
          au: 'https://cdn/au.mp3',
        },
        examples: { us: 'https://cdn/ex-us.mp3' },
      });
    });

    it('devuelve audioUrls null cuando la API devuelve null', () => {
      const raw = FlashcardApiModelMother.create({ audioUrls: null });

      const vm = mapFlashcard(raw);

      expect(vm.audioUrls).toBeNull();
    });
  });

  describe('mapFlashcardsPage', () => {
    it('mapea la paginación y los items correctamente', () => {
      const raw: FlashcardsListApiModel = {
        data: [
          FlashcardApiModelMother.create({ id: 'fc-001' }),
          FlashcardApiModelMother.create({ id: 'fc-002' }),
        ],
        total: 42,
        page: 2,
        pageSize: 20,
      };

      const page = mapFlashcardsPage(raw);

      expect(page.total).toBe(42);
      expect(page.page).toBe(2);
      expect(page.pageSize).toBe(20);
      expect(page.items).toHaveLength(2);
      expect(page.items[0].id).toBe('fc-001');
      expect(page.items[1].id).toBe('fc-002');
    });

    it('devuelve items vacío cuando data es un array vacío', () => {
      const raw: FlashcardsListApiModel = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
      };

      const page = mapFlashcardsPage(raw);

      expect(page.items).toEqual([]);
      expect(page.total).toBe(0);
    });
  });
});
