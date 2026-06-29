import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useStudyKeyboardShortcuts } from '../useStudyKeyboardShortcuts';

function KeyboardHarness({
  enabled,
  onFlip,
  onNext,
  onPause,
}: {
  enabled: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPause?: () => void;
}): null {
  useStudyKeyboardShortcuts({ enabled, onFlip, onNext, onPause });
  return null;
}

describe('useStudyKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onFlip with Space and onNext with Enter', () => {
    const onFlip = vi.fn();
    const onNext = vi.fn();

    render(<KeyboardHarness enabled onFlip={onFlip} onNext={onNext} />);

    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onFlip).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPause with P when provided', () => {
    const onPause = vi.fn();

    render(
      <KeyboardHarness
        enabled
        onFlip={vi.fn()}
        onNext={vi.fn()}
        onPause={onPause}
      />,
    );

    fireEvent.keyDown(window, { key: 'p' });

    expect(onPause).toHaveBeenCalledTimes(1);
  });
});
