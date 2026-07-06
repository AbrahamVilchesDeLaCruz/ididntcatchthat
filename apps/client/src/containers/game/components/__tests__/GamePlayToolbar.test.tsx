import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { GamePlayToolbar } from '../GamePlayToolbar';
import { usePrefersFinePointer } from '../../hooks/usePrefersFinePointer';

vi.mock('../../hooks/usePrefersFinePointer', () => ({
  usePrefersFinePointer: vi.fn(() => true),
}));

const mockedUsePrefersFinePointer = vi.mocked(usePrefersFinePointer);

describe('GamePlayToolbar', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    vi.clearAllMocks();
    mockedUsePrefersFinePointer.mockReturnValue(true);
  });

  it('renders keyboard shortcuts on fine pointer devices in desktop toolbar', () => {
    render(
      <GamePlayToolbar
        currentIndex={0}
        totalCount={5}
        correctCount={0}
        incorrectCount={0}
        canPause={false}
      />,
    );

    const desktop = screen.getByTestId('play-toolbar-desktop');

    expect(within(desktop).getByText('Flip card')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('play-toolbar-mobile')).queryByText(
        'Flip card',
      ),
    ).not.toBeInTheDocument();
  });

  it('shows touch hints in mobile help popover on coarse pointer devices', () => {
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

    const mobile = screen.getByTestId('play-toolbar-mobile');

    expect(within(mobile).queryByText('Tap to reveal')).not.toBeInTheDocument();

    fireEvent.click(
      within(mobile).getByRole('button', {
        name: en.game.play.controlsHelpAriaLabel,
      }),
    );

    expect(within(mobile).getByText('Tap to reveal')).toBeInTheDocument();
    expect(
      within(mobile).getByText("Didn't know — swipe left"),
    ).toBeInTheDocument();
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

    expect(
      within(screen.getByTestId('play-toolbar-desktop')).getByRole(
        'progressbar',
      ),
    ).toHaveAttribute('aria-valuenow', '3');
    expect(
      within(screen.getByTestId('play-toolbar-desktop')).getByRole('button', {
        name: 'Pause',
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByTestId('play-toolbar-desktop')).getByRole('button', {
        name: 'Pause',
      }),
    );

    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('renders study shortcuts in desktop toolbar when variant is study', () => {
    render(
      <GamePlayToolbar
        variant="study"
        currentIndex={2}
        totalCount={10}
        correctCount={0}
        incorrectCount={0}
        viewedCount={3}
        canPause
        onPause={vi.fn()}
      />,
    );

    const desktop = screen.getByTestId('play-toolbar-desktop');

    expect(within(desktop).getByText(/Review · 3 of 10/)).toBeInTheDocument();
    expect(within(desktop).getByText('Next card')).toBeInTheDocument();
    expect(within(desktop).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '3',
    );
    expect(within(desktop).queryByText('Mark correct')).not.toBeInTheDocument();
  });
});
