import * as React from 'react';
import { cn } from '@/common/lib/utils';

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue>({
  open: false,
  setOpen: () => undefined,
});

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Sheet = ({
  open = false,
  onOpenChange,
  children,
}: SheetProps): React.ReactElement => {
  return (
    <SheetContext.Provider
      value={{ open, setOpen: onOpenChange ?? (() => undefined) }}
    >
      {children}
    </SheetContext.Provider>
  );
};

interface SheetTriggerProps {
  asChild?: boolean;
  children: React.ReactElement;
}

const SheetTrigger = ({
  asChild,
  children,
}: SheetTriggerProps): React.ReactElement => {
  const { setOpen } = React.useContext(SheetContext);
  if (asChild) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent) => void;
    }>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        setOpen(true);
      },
    });
  }
  return <button onClick={() => setOpen(true)}>{children}</button>;
};

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right' | 'top' | 'bottom';
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, children, side = 'right', ...props }, ref) => {
    const { open, setOpen } = React.useContext(SheetContext);

    if (!open) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
        {/* Panel */}
        <div
          ref={ref}
          className={cn(
            'fixed inset-y-0 z-50 flex flex-col bg-[var(--color-bg-surface)] shadow-xl',
            side === 'left' ? 'left-0' : 'right-0',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  },
);
SheetContent.displayName = 'SheetContent';

export { Sheet, SheetTrigger, SheetContent };
