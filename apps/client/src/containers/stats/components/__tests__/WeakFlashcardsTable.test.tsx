import { describe, it, expect } from 'vitest';
import { type ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WeakFlashcardsTable } from '../WeakFlashcardsTable';

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
});
