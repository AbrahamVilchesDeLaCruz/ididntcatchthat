import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GamePlayToolbar } from '../GamePlayToolbar';
import { usePrefersFinePointer } from '../../hooks/usePrefersFinePointer';

vi.mock('../../hooks/usePrefersFinePointer', () => ({
  usePrefersFinePointer: vi.fn(() => true),
}));

const mockedUsePrefersFinePointer = vi.mocked(usePrefersFinePointer);

describe('GamePlayToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUsePrefersFinePointer.mockReturnValue(true);
  });

  it('renders keyboard shortcuts on fine pointer devices', () => {
    render(
      <GamePlayToolbar
        currentIndex={0}
        totalCount={5}
        correctCount={0}
        incorrectCount={0}
        canPause={false}
      />,
    );

    expect(screen.getByText('Flip card')).toBeInTheDocument();
    expect(screen.queryByText('Tap to reveal')).not.toBeInTheDocument();
  });

  it('renders touch shortcuts on coarse pointer devices', () => {
    mockedUsePrefersFinePointer.mockReturnValue(false);

    render(
      <GamePlayToolbar
        currentIndex={0}
        totalCount={5}
        correctCount={0}
        incorrectCount={0}
        canPause={false}
      />,
    );

    expect(screen.getByText('Tap to reveal')).toBeInTheDocument();
    expect(screen.getByText("Didn't know — swipe left")).toBeInTheDocument();
    expect(screen.queryByText('Flip card')).not.toBeInTheDocument();
  });

  it('renders progress segments and pause control when allowed', () => {
    const onPause = vi.fn();

    render(
      <GamePlayToolbar
        currentIndex={1}
        totalCount={5}
        correctCount={2}
        incorrectCount={1}
        canPause
        onPause={onPause}
      />,
    );

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '3',
    );
    expect(screen.getByText('Pause game')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

    expect(onPause).toHaveBeenCalledTimes(1);
  });
});
