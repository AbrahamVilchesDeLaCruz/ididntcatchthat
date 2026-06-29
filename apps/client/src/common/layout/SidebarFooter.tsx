import { type ReactElement } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/core/i18n';
import { useAuthStore } from '@/core/store/auth.store';
import { useLogout } from '@/containers/auth/api';
import { SidebarUserBlock } from '@/common/layout/SidebarUserBlock';

interface SidebarFooterProps {
  onNavigate?: () => void;
}

export const SidebarFooter = ({
  onNavigate,
}: SidebarFooterProps): ReactElement => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { mutate: logoutApi } = useLogout();

  const handleLogout = (): void => {
    logoutApi(undefined, {
      onSettled: () => {
        logout();
        void navigate('/', { replace: true });
      },
    });
    onNavigate?.();
  };

  return (
    <div className="mt-auto shrink-0 border-t border-[var(--color-border)] px-3 pt-4">
      <div className="flex items-center gap-2">
        <SidebarUserBlock onNavigate={onNavigate} variant="compact" />

        <button
          type="button"
          onClick={handleLogout}
          aria-label={t.sidebar.logout}
          title={t.sidebar.logout}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] p-2.5 text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
        >
          <LogOut size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
};
