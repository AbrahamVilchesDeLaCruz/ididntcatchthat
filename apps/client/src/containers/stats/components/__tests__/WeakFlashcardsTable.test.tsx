import { describe, it, expect, vi } from 'vitest';
import { type ReactElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WeakFlashcardsTable } from '../WeakFlashcardsTable';
import { flashcardCatalogKeys } from '@/core/api/flashcard-catalog.api';

const renderTable = (ui: ReactElement): ReturnType<typeof render> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe('WeakFlashcardsTable', () => {
  it('shows expression header and renders expression value', () => {
    renderTable(
      <WeakFlashcardsTable
        data={[
          {
            flashcardId: 'fc-1',
            expression: 'gonna',
            module: 'connected_speech',
            category: 'connected_speech',
            subcategory: 'informal_going_to',
            errorCount: 3,
            lastAttemptAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ]}
      />,
    );

    expect(
      screen.getByRole('columnheader', { name: 'Expression' }),
    ).toBeInTheDocument();
    expect(screen.getByText('gonna')).toBeInTheDocument();
  });

  it('does not show Flashcard ID header anymore', () => {
    renderTable(<WeakFlashcardsTable data={[]} />);

    expect(
      screen.queryByRole('columnheader', { name: 'Flashcard ID' }),
    ).not.toBeInTheDocument();
  });

  it('hides rows with zero errors', () => {
    renderTable(
      <WeakFlashcardsTable
        data={[
          {
            flashcardId: 'fc-zero',
            expression: 'hidden',
            module: 'native_sounds',
            category: 'native_sounds',
            subcategory: 'test',
            errorCount: 0,
            lastAttemptAt: new Date(),
          },
        ]}
      />,
    );

    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  it('shows module-specific empty state when filtered category has no weak cards', () => {
    renderTable(
      <WeakFlashcardsTable data={[]} selectedCategory="native_sounds" />,
    );

    expect(screen.getByText('No errors in this module!')).toBeInTheDocument();
  });

  it('calls onPractice when practice button is clicked', () => {
    const onPractice = vi.fn();
    const item = {
      flashcardId: 'fc-1',
      expression: 'gonna',
      module: 'connected_speech',
      category: 'connected_speech',
      subcategory: 'informal_going_to',
      errorCount: 3,
      lastAttemptAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    renderTable(<WeakFlashcardsTable data={[item]} onPractice={onPractice} />);

    fireEvent.click(screen.getByRole('button', { name: 'Practice' }));

    expect(onPractice).toHaveBeenCalledWith(item);
  });

  it('uses catalog labels for subcategories when available', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(flashcardCatalogKeys.catalog(), {
      categories: [
        {
          value: 'connected_speech',
          label: { en: 'Connected Speech', es: 'Habla conectada' },
          subcategories: [
            {
              value: 'informal_going_to',
              label: { en: 'Going to', es: 'Going to' },
              description: { en: '', es: '' },
              anchorExamples: [],
            },
          ],
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <WeakFlashcardsTable
          data={[
            {
              flashcardId: 'fc-1',
              expression: 'gonna',
              module: 'connected_speech',
              category: 'connected_speech',
              subcategory: 'informal_going_to',
              errorCount: 2,
              lastAttemptAt: new Date('2026-01-01T00:00:00.000Z'),
            },
          ]}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Going to')).toBeInTheDocument();
  });

  it('NO renderiza controles de paginación si solo hay una página', () => {
    renderTable(
      <WeakFlashcardsTable
        data={[
          {
            flashcardId: 'fc-1',
            expression: 'gonna',
            module: 'connected_speech',
            category: 'connected_speech',
            subcategory: 'informal_going_to',
            errorCount: 3,
            lastAttemptAt: new Date(),
          },
        ]}
        pagination={{
          page: 1,
          limit: 10,
          total_items: 1,
          total_pages: 1,
          has_next_page: false,
          has_prev_page: false,
        }}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /next/i }),
    ).not.toBeInTheDocument();
  });

  it('renderiza botones Previous/Next cuando hay varias páginas', () => {
    renderTable(
      <WeakFlashcardsTable
        data={[]}
        pagination={{
          page: 2,
          limit: 10,
          total_items: 25,
          total_pages: 3,
          has_next_page: true,
          has_prev_page: true,
        }}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: /previous/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('Previous está disabled en la primera página', () => {
    renderTable(
      <WeakFlashcardsTable
        data={[]}
        pagination={{
          page: 1,
          limit: 10,
          total_items: 25,
          total_pages: 3,
          has_next_page: true,
          has_prev_page: false,
        }}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('Next está disabled en la última página', () => {
    renderTable(
      <WeakFlashcardsTable
        data={[]}
        pagination={{
          page: 3,
          limit: 10,
          total_items: 25,
          total_pages: 3,
          has_next_page: false,
          has_prev_page: true,
        }}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('Previous llama onPageChange(page - 1) y Next llama onPageChange(page + 1)', () => {
    const onPageChange = vi.fn();
    renderTable(
      <WeakFlashcardsTable
        data={[]}
        pagination={{
          page: 2,
          limit: 10,
          total_items: 25,
          total_pages: 3,
          has_next_page: true,
          has_prev_page: true,
        }}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
