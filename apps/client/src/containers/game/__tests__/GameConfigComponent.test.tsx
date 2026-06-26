import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameConfigComponent } from '../GameConfigComponent';
import type { FlashcardCatalogApiModel } from '@/core/api/flashcard-catalog.api-model';

const catalog: FlashcardCatalogApiModel = {
  categories: [
    {
      value: 'native_sounds',
      label: { en: 'Native Sounds', es: 'Sonidos nativos' },
      subcategories: [
        {
          value: 't_soft_between_vowels',
          label: { en: 'Soft T', es: 'T suave' },
          description: { en: 'desc', es: 'desc' },
          anchorExamples: [],
        },
        {
          value: 'b_ball',
          label: { en: 'B sound', es: 'Sonido B' },
          description: { en: 'desc', es: 'desc' },
          anchorExamples: [],
        },
      ],
    },
  ],
};

const defaultProps = {
  selectedModule: 'native_sounds' as const,
  selectedSubcategory: null as string | null,
  selectedCount: 10 as const,
  catalog,
  isPending: false,
  onModuleChange: vi.fn(),
  onSubcategoryChange: vi.fn(),
  onCountChange: vi.fn(),
  onStart: vi.fn(),
};

describe('GameConfigComponent', () => {
  it('shows subcategory options when a category is selected', () => {
    render(<GameConfigComponent {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Whole category' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Soft T' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B sound' })).toBeInTheDocument();
  });

  it('does not show subcategory step for random module', () => {
    render(<GameConfigComponent {...defaultProps} selectedModule="random" />);

    expect(
      screen.queryByRole('button', { name: 'Whole category' }),
    ).not.toBeInTheDocument();
  });

  it('calls onSubcategoryChange when a subcategory is selected', () => {
    const onSubcategoryChange = vi.fn();
    render(
      <GameConfigComponent
        {...defaultProps}
        onSubcategoryChange={onSubcategoryChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Soft T' }));

    expect(onSubcategoryChange).toHaveBeenCalledWith('t_soft_between_vowels');
  });
});
