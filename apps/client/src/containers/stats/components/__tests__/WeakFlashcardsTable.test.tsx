import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeakFlashcardsTable } from '../WeakFlashcardsTable';

describe('WeakFlashcardsTable', () => {
  it('shows Expresión header and renders expression value', () => {
    render(
      <WeakFlashcardsTable
        data={[
          {
            flashcardId: 'fc-1',
            expression: 'gonna',
            module: 'connected_speech',
            errorCount: 3,
            lastAttemptAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ]}
      />,
    );

    expect(
      screen.getByRole('columnheader', { name: 'Expresión' }),
    ).toBeInTheDocument();
    expect(screen.getByText('gonna')).toBeInTheDocument();
  });

  it('does not show Flashcard ID header anymore', () => {
    render(<WeakFlashcardsTable data={[]} />);

    expect(
      screen.queryByRole('columnheader', { name: 'Flashcard ID' }),
    ).not.toBeInTheDocument();
  });
});
