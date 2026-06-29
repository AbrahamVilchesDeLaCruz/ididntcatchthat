import { type ReactElement } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/core/i18n';
import { useAuthStore } from '@/core/store/auth.store';
import { useLogout } from '@/containers/auth/api';
import { ThemeToggle } from '@/common/components/ThemeToggle';
import { LocaleToggle } from '@/common/components/LocaleToggle';
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
    <div className="mt-auto shrink-0 border-t border-[var(--color-border)] pt-4">
      <SidebarUserBlock onNavigate={onNavigate} />

      <div className="mb-3 flex gap-2 px-3">
        <div className="flex-1">
          <ThemeToggle variant="pill" />
        </div>
        <div className="flex-1">
          <LocaleToggle variant="pill" />
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
      >
        <LogOut size={18} aria-hidden />
        {t.sidebar.logout}
      </button>
    </div>
  );
};
