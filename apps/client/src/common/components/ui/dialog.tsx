import * as React from 'react';
import { cn } from '@/common/lib/utils';
import { useFocusTrap } from '@/common/hooks/useFocusTrap';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  setOpen: () => undefined,
});

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({
  open = false,
  onOpenChange,
  children,
}: DialogProps): React.ReactElement => (
  <DialogContext.Provider
    value={{ open, setOpen: onOpenChange ?? (() => undefined) }}
  >
    {children}
  </DialogContext.Provider>
);

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactElement;
}

const DialogTrigger = ({
  asChild,
  children,
}: DialogTriggerProps): React.ReactElement => {
  const { setOpen } = React.useContext(DialogContext);
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

const DIALOG_TITLE_ID = 'dialog-title';

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  'aria-describedby'?: string;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(DialogContext);
    const contentRef = useFocusTrap(open, () => {
      setOpen(false);
    });

    const setRefs = (node: HTMLDivElement | null): void => {
      contentRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    if (!open) return null;

    return (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
        <div
          ref={setRefs}
          role="dialog"
          aria-modal="true"
          aria-labelledby={DIALOG_TITLE_ID}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-xl',
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
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement => (
  <div className={cn('mb-4 space-y-1', className)} {...props} />
);

const DialogTitle = ({
  className,
  id = DIALOG_TITLE_ID,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.ReactElement => (
  <h2
    id={id}
    className={cn(
      'text-lg font-semibold text-[var(--color-text-primary)]',
      className,
    )}
    {...props}
  />
);

const DialogDescription = ({
  className,
  id,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.ReactElement => (
  <p
    id={id}
    className={cn('text-sm text-[var(--color-text-secondary)]', className)}
    {...props}
  />
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
