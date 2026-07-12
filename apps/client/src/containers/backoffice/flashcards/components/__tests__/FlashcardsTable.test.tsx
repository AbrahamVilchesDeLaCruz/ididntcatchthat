import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FlashcardsTable } from '../FlashcardsTable';
import { en } from '@/core/i18n/en';
import { useI18n } from '@/core/i18n/i18n.store';
import type { FlashcardVM } from '../../flashcards.types';
import type { FlashcardCatalogApiModel } from '../../api/flashcards.api-model';

const t = en.backoffice.flashcards.table;

const buildVm = (overrides?: Partial<FlashcardVM>): FlashcardVM => ({
  id: 'fc-1',
  expression: 'gonna',
  meaning: 'going to',
  category: 'connected_speech',
  subcategory: 'informal_going_to',
  ipaNotation: null,
  nativeSpeech: null,
  audioStatus: 'ready',
  audioUrls: null,
  examples: [],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const noop = (): void => undefined;

const baseProps = {
  flashcards: [buildVm()],
  isLoading: false,
  onView: noop,
  onEdit: noop,
  onDelete: noop,
};

describe('FlashcardsTable', () => {
  beforeEachTest();

  it('renders catalog label for the known category and subcategory', () => {
    const catalog: FlashcardCatalogApiModel = {
      categories: [
        {
          value: 'connected_speech',
          label: { es: 'Connected speech', en: 'Connected speech' },
          subcategories: [
            {
              value: 'informal_going_to',
              label: { es: 'Informal going to', en: 'Informal going to' },
              description: { es: '', en: '' },
              anchorExamples: [],
            },
          ],
        },
      ],
    };

    render(<FlashcardsTable {...baseProps} catalog={catalog} />);

    // English locale is the default in i18n.store
    expect(screen.getByText('Connected speech')).toBeInTheDocument();
    expect(screen.getByText('Informal going to')).toBeInTheDocument();
  });

  it('capitalizes the first letter of the expression and meaning in display', () => {
    render(<FlashcardsTable {...baseProps} />);

    expect(screen.getByText('Gonna')).toBeInTheDocument();
    expect(screen.getByText('Going to')).toBeInTheDocument();
  });

  it('falls back to em-dash when the category is missing from the catalog', () => {
    render(<FlashcardsTable {...baseProps} catalog={undefined} />);

    expect(screen.getAllByText(t.unknownCategory).length).toBeGreaterThan(0);
  });

  it('falls back to em-dash when the subcategory is missing from the catalog', () => {
    render(<FlashcardsTable {...baseProps} catalog={undefined} />);

    expect(screen.getAllByText(t.unknownSubcategory).length).toBeGreaterThan(0);
  });
});

function beforeEachTest(): void {
  // Reset i18n store to a known baseline so locale does not bleed
  // between tests since zustand's persist is global.
  useI18n.setState({ locale: 'en', t: en });
}
