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

  it('siempre invoca el ÚLTIMO callback aunque cambie la identidad entre renders (refs, no stale closure)', () => {
    const onFlip1 = vi.fn();
    const onFlip2 = vi.fn();

    const { rerender } = render(
      <KeyboardHarness enabled onFlip={onFlip1} onNext={vi.fn()} />,
    );
    fireEvent.keyDown(window, { key: ' ' });
    expect(onFlip1).toHaveBeenCalledTimes(1);

    // Re-render con un callback nuevo. La listener NO debería re-suscribirse
    // ni capturar la identidad vieja.
    rerender(<KeyboardHarness enabled onFlip={onFlip2} onNext={vi.fn()} />);
    fireEvent.keyDown(window, { key: ' ' });
    expect(onFlip1).toHaveBeenCalledTimes(1);
    expect(onFlip2).toHaveBeenCalledTimes(1);
  });

  it('ignora la pulsación si el target es un input/textarea (no roba foco al usuario)', () => {
    const onFlip = vi.fn();
    render(<KeyboardHarness enabled onFlip={onFlip} onNext={vi.fn()} />);

    const input = document.createElement('input');
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: ' ' });
    document.body.removeChild(input);

    expect(onFlip).not.toHaveBeenCalled();
  });
});
