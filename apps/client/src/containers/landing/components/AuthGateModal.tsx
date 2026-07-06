import { type ReactElement, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useI18n } from '@/core/i18n';
import { useFocusTrap } from '@/common/hooks/useFocusTrap';

interface AuthGateModalProps {
  open: boolean;
  onClose: () => void;
}

export const AuthGateModal = ({
  open,
  onClose,
}: AuthGateModalProps): ReactElement | null => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const ag = t.landing.authGate;
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useFocusTrap(open, onClose);

  if (!open) return null;

  const handleLogin = (): void => {
    void navigate('/auth/login');
    onClose();
  };

  const handleRegister = (): void => {
    void navigate('/auth/register');
    onClose();
  };

  const handleGuest = (): void => {
    void navigate('/game');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-sm rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={ag.close}
          className="absolute right-4 top-4 flex items-center justify-center rounded-full p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
        >
          <X size={18} strokeWidth={2} />
        </button>

        <h2
          id={titleId}
          className="mb-2 text-xl font-bold text-[var(--color-text-primary)]"
        >
          {ag.title}
        </h2>
        <p
          id={descriptionId}
          className="mb-6 text-sm text-[var(--color-text-secondary)]"
        >
          {ag.subtitle}
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-[var(--radius-md)] bg-[var(--color-brand)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            {ag.login}
          </button>
          <button
            type="button"
            onClick={handleRegister}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-brand)] py-3 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-dim)] active:scale-[0.98]"
          >
            {ag.register}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-muted)]">
            {ag.divider}
          </span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          className="w-full rounded-[var(--radius-md)] py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] active:scale-[0.98]"
        >
          {ag.guest}
        </button>
      </div>
    </div>
  );
};
