import { type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFocusTrap } from '../useFocusTrap';

function TrapFixture({
  active,
  onEscape,
}: {
  active: boolean;
  onEscape?: () => void;
}): ReactElement {
  const ref = useFocusTrap(active, onEscape);

  return (
    <div>
      <button type="button">Outside</button>
      <div ref={ref}>
        <button type="button">First</button>
        <button type="button">Second</button>
      </div>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('focuses the first focusable element when active', () => {
    render(<TrapFixture active />);

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('calls onEscape when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();

    render(<TrapFixture active onEscape={onEscape} />);

    await user.keyboard('{Escape}');

    expect(onEscape).toHaveBeenCalledOnce();
  });

  it('wraps focus from last to first on Tab', async () => {
    const user = userEvent.setup();

    render(<TrapFixture active />);

    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });

    expect(first).toHaveFocus();
    await user.tab();
    expect(second).toHaveFocus();
    await user.tab();
    expect(first).toHaveFocus();
  });

  it('wraps focus from first to last on Shift+Tab', async () => {
    const user = userEvent.setup();

    render(<TrapFixture active />);

    const first = screen.getByRole('button', { name: 'First' });
    const second = screen.getByRole('button', { name: 'Second' });

    expect(first).toHaveFocus();
    await user.tab({ shift: true });
    expect(second).toHaveFocus();
  });

  it('restores focus to the previously focused element on deactivate', () => {
    const { rerender } = render(
      <>
        <button type="button">Trigger</button>
        <TrapFixture active={false} />
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    trigger.focus();

    rerender(
      <>
        <button type="button">Trigger</button>
        <TrapFixture active />
      </>,
    );

    rerender(
      <>
        <button type="button">Trigger</button>
        <TrapFixture active={false} />
      </>,
    );

    expect(trigger).toHaveFocus();
  });
});
