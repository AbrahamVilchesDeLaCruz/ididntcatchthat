import { useState, type ReactElement } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/core/store/auth.store';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { useLogout } from '@/containers/auth/api';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/common/components/ui/sheet';
import { Button } from '@/common/components/ui/button';
import { ThemeToggle } from '@/common/components/ThemeToggle';
import {
  HeadphonesIcon,
  WaveformIcon,
  TrophyIcon,
  ChartLineIcon,
  FlashcardIcon,
  PulseIcon,
  UsersIcon,
} from '@/common/components/NavIcons';

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-[var(--color-brand-dim)] text-[var(--color-brand)]'
      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]'
  }`;

interface SidebarContentProps {
  onNavigate?: () => void;
}

const SidebarContent = ({ onNavigate }: SidebarContentProps): ReactElement => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { mutate: logoutApi } = useLogout();
  const {
    canAccessBackoffice,
    canAccessObservability,
    canManageFlashcards,
    isUser,
    isAdmin,
    canStudy,
  } = useCurrentUser();

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
    <>
      {/* Wordmark */}
      <Link
        to="/"
        onClick={onNavigate}
        className="mb-8 block px-3 text-lg font-bold leading-none tracking-tight text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        i didn&apos;t <span className="text-[var(--color-brand)]">catch</span>{' '}
        that
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {/* Juego — siempre visible */}
        <div className="mb-2">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Juego
          </p>
          <NavLink to="/game" className={navLinkClass} onClick={onNavigate}>
            <HeadphonesIcon /> Jugar
          </NavLink>
        </div>

        {/* Aprender — usuarios registrados (no invitados) */}
        {canStudy && (
          <div className="mb-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Aprender
            </p>
            <NavLink to="/study" className={navLinkClass} onClick={onNavigate}>
              <FlashcardIcon /> Estudiar
            </NavLink>
          </div>
        )}

        {/* Mi progreso — user, teacher, admin */}
        {(isUser || isAdmin || canAccessBackoffice) && (
          <div className="mb-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Mi progreso
            </p>
            <NavLink to="/stats" className={navLinkClass} onClick={onNavigate}>
              <WaveformIcon /> Estadísticas
            </NavLink>
            <NavLink
              to="/ranking"
              className={navLinkClass}
              onClick={onNavigate}
            >
              <TrophyIcon /> Ranking
            </NavLink>
          </div>
        )}

        {/* Backoffice — teacher + admin */}
        {canAccessBackoffice && (
          <div className="mb-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Backoffice
            </p>
            <NavLink
              to="/backoffice/games"
              className={navLinkClass}
              onClick={onNavigate}
            >
              <ChartLineIcon /> Métricas de juegos
            </NavLink>
            <NavLink
              to="/backoffice/users"
              className={navLinkClass}
              onClick={onNavigate}
            >
              <UsersIcon /> Métricas de usuarios
            </NavLink>
            {canManageFlashcards && (
              <NavLink
                to="/backoffice/flashcards"
                className={navLinkClass}
                onClick={onNavigate}
              >
                <FlashcardIcon /> Flashcards
              </NavLink>
            )}
          </div>
        )}

        {/* Observabilidad — admin only */}
        {canAccessObservability && (
          <div className="mb-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Sistema
            </p>
            <NavLink
              to="/backoffice/observability"
              className={navLinkClass}
              onClick={onNavigate}
            >
              <PulseIcon /> Observabilidad
            </NavLink>
          </div>
        )}
      </nav>

      {/* Theme toggle */}
      <div className="mb-1 px-3">
        <ThemeToggle variant="pill" />
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
      >
        Cerrar sesión
      </button>
    </>
  );
};

export const AppSidebar = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 h-svh sticky top-0 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] flex-col px-4 py-6 shrink-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger + Sheet drawer */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
            >
              <Menu className="h-5 w-5 text-[var(--color-text-primary)]" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] flex flex-col px-4 py-6 p-0"
          >
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
