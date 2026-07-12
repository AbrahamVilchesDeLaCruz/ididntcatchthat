/* eslint-disable react-refresh/only-export-components -- compound-component module: exports the assembled AppSelect object, not individual components */
import type { ReactElement } from 'react';
import { Select } from '@base-ui/react/select';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/common/lib/utils';

/**
 * Token-driven `AppSelect` compound wrapper on `@base-ui/react` Select.
 *
 * Mirrors the `common/components/ui/*` convention: subcomponents are exposed 1:1
 * from Base UI, with our design-token chrome merged via `cn(...)`. The theme is
 * CSS-variable driven (`data-theme` on `<html>` cascades `--color-*`), so the
 * wrapper carries zero theme-detection logic. `Portal` renders the popup to
 * `document.body`, and `Popup` sits at `z-[60]` so it clears the `z-50` modal
 * backdrops used by the flashcards modals.
 */

const AppSelectRoot = Select.Root;

const AppSelectTrigger = ({
  className,
  children,
  ...props
}: Select.Trigger.Props): ReactElement => (
  <Select.Trigger
    className={cn(
      'flex w-full items-center justify-between gap-2',
      'rounded-lg px-3 py-2',
      'border border-[var(--color-border)] bg-[var(--color-bg-elevated)]',
      'text-sm text-[var(--color-text-primary)]',
      'cursor-pointer',
      'focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-dim)]',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40',
      className,
    )}
    {...props}
  >
    {children}
  </Select.Trigger>
);

const AppSelectValue = Select.Value;

const AppSelectIcon = ({
  className,
  ...props
}: Select.Icon.Props): ReactElement => (
  <Select.Icon
    className={cn(
      'flex shrink-0 items-center text-[var(--color-text-secondary)]',
      'data-[popup-open]:rotate-180 transition-transform duration-150',
      className,
    )}
    {...props}
  >
    <ChevronDown size={16} aria-hidden="true" />
  </Select.Icon>
);

const AppSelectPortal = Select.Portal;

const AppSelectPositioner = ({
  className,
  sideOffset = 4,
  ...props
}: Select.Positioner.Props): ReactElement => (
  <Select.Positioner
    sideOffset={sideOffset}
    className={cn('z-[60] outline-none', className)}
    {...props}
  />
);

const AppSelectPopup = ({
  className,
  ...props
}: Select.Popup.Props): ReactElement => (
  <Select.Popup
    className={cn(
      'min-w-[var(--anchor-width)] max-h-[var(--available-height)]',
      'rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-lg',
      'p-1',
      'origin-[var(--transform-origin)] transition-[opacity,transform] duration-150',
      'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
      'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
      className,
    )}
    {...props}
  />
);

const AppSelectList = ({
  className,
  ...props
}: Select.List.Props): ReactElement => (
  <Select.List
    className={cn('max-h-60 overflow-y-auto outline-none', className)}
    {...props}
  />
);

const AppSelectItem = ({
  className,
  children,
  ...props
}: Select.Item.Props): ReactElement => (
  <Select.Item
    className={cn(
      'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2',
      'text-sm text-[var(--color-text-primary)] outline-none',
      'data-[highlighted]:bg-[var(--color-brand-dim)] data-[highlighted]:text-[var(--color-text-primary)]',
      'data-[selected]:bg-[var(--color-brand)] data-[selected]:font-semibold data-[selected]:text-white',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40',
      className,
    )}
    {...props}
  >
    <Select.ItemText>{children}</Select.ItemText>
  </Select.Item>
);

// Compound wrapper: the styled subcomponents are internal; only the assembled
// `AppSelect` object and its types are exported, which react-refresh cannot
// statically recognize as a component export.
export const AppSelect = {
  Root: AppSelectRoot,
  Trigger: AppSelectTrigger,
  Value: AppSelectValue,
  Icon: AppSelectIcon,
  Portal: AppSelectPortal,
  Positioner: AppSelectPositioner,
  Popup: AppSelectPopup,
  List: AppSelectList,
  Item: AppSelectItem,
  ItemText: Select.ItemText,
  ItemIndicator: Select.ItemIndicator,
  Group: Select.Group,
  GroupLabel: Select.GroupLabel,
  Separator: Select.Separator,
  Label: Select.Label,
};

export type AppSelectRootProps<Value = string> = Select.Root.Props<Value>;
export type AppSelectItemProps = Select.Item.Props;
