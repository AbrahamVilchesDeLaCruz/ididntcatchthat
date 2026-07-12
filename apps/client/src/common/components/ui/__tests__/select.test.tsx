import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { AppSelect, type AppSelectRootProps } from '../select';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';

// jsdom lacks ResizeObserver / scrollIntoView which Base UI's positioner and
// keyboard navigation rely on. Provide minimal polyfills scoped to this suite.
beforeEach(() => {
  useI18n.setState({ locale: 'en', t: en });
  globalThis.ResizeObserver ??= class {
    observe = (): void => undefined;
    unobserve = (): void => undefined;
    disconnect = (): void => undefined;
  };
  Element.prototype.scrollIntoView = (): void => undefined;
});

const options = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
] as const;

interface HarnessProps {
  value?: string;
  disabled?: boolean;
  required?: boolean;
  onValueChange?: AppSelectRootProps['onValueChange'];
}

const Harness = ({
  value,
  disabled,
  required,
  onValueChange,
}: HarnessProps): ReactElement => (
  <AppSelect.Root
    items={options}
    value={value}
    disabled={disabled}
    required={required}
    onValueChange={onValueChange}
  >
    <AppSelect.Trigger>
      <AppSelect.Value placeholder="Pick one" />
      <AppSelect.Icon />
    </AppSelect.Trigger>
    <AppSelect.Portal>
      <AppSelect.Positioner>
        <AppSelect.Popup>
          <AppSelect.List>
            {options.map((o) => (
              <AppSelect.Item key={o.value} value={o.value}>
                {o.label}
              </AppSelect.Item>
            ))}
          </AppSelect.List>
        </AppSelect.Popup>
      </AppSelect.Positioner>
    </AppSelect.Portal>
  </AppSelect.Root>
);

describe('AppSelect', () => {
  it('renders trigger with selected value label', () => {
    render(<Harness value="a" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Apple');
  });

  it('renders placeholder when no value', () => {
    render(<Harness />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick one');
  });

  it('opens popup on trigger click and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('fires onValueChange when option selected', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Banana' }));

    expect(onValueChange).toHaveBeenCalledWith('b', expect.anything());
  });

  it('disabled trigger is not clickable, popup stays closed', async () => {
    const user = userEvent.setup();
    render(<Harness disabled />);

    await user.click(screen.getByRole('combobox'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('required propagates aria-required', () => {
    render(<Harness required />);
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('keyboard nav: ArrowDown moves highlight, Enter selects', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);

    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onValueChange).toHaveBeenCalled();
  });

  it('popup renders in document.body via Portal', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<Harness />);

    await user.click(screen.getByRole('combobox'));
    const listbox = await screen.findByRole('listbox');

    expect(baseElement).toContainElement(listbox);
  });

  it('highlighted item has data-highlighted', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      const highlighted = document.querySelector('[data-highlighted]');
      expect(highlighted).toBeInTheDocument();
    });
  });

  it('selected item has data-selected + aria-selected', async () => {
    const user = userEvent.setup();
    render(<Harness value="a" />);

    await user.click(screen.getByRole('combobox'));
    const selected = await screen.findByRole('option', { name: 'Apple' });

    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveAttribute('data-selected');
  });

  it('chevron icon is rendered in trigger', () => {
    const { container } = render(<Harness />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
