import { useState, type ReactElement } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/core/store/auth.store';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { useLogout } from '@/containers/auth/api';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-white/10 text-white'
      : 'text-gray-400 hover:text-white hover:bg-white/5'
  }`;

interface SidebarContentProps {
  onNavigate?: () => void;
}

const SidebarContent = ({ onNavigate }: SidebarContentProps): ReactElement => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { mutate: logoutApi } = useLogout();
  const { canAccessBackoffice, canAccessObservability, isUser, isAdmin } =
    useCurrentUser();

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
      {/* Logo */}
      <Link
        to="/"
        onClick={onNavigate}
        className="text-white font-bold text-lg mb-8 px-3 block"
      >
        ididntcatchthat
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {/* Juego — siempre visible */}
        <div className="mb-2">
          <p className="text-xs uppercase text-gray-500 px-3 mb-2 font-semibold tracking-wider">
            Juego
          </p>
          <NavLink to="/game" className={navLinkClass} onClick={onNavigate}>
            🎮 Jugar
          </NavLink>
        </div>

        {/* Mi progreso — user, teacher, admin */}
        {(isUser || isAdmin || canAccessBackoffice) && (
          <div className="mb-2">
            <p className="text-xs uppercase text-gray-500 px-3 mb-2 font-semibold tracking-wider">
              Mi progreso
            </p>
            <NavLink to="/stats" className={navLinkClass} onClick={onNavigate}>
              📊 Estadísticas
            </NavLink>
          </div>
        )}

        {/* Backoffice — teacher + admin */}
        {canAccessBackoffice && (
          <div className="mb-2">
            <p className="text-xs uppercase text-gray-500 px-3 mb-2 font-semibold tracking-wider">
              Backoffice
            </p>
            <NavLink
              to="/backoffice/flashcards"
              className={navLinkClass}
              onClick={onNavigate}
            >
              🃏 Flashcards
            </NavLink>
            <NavLink
              to="/backoffice/games"
              className={navLinkClass}
              onClick={onNavigate}
            >
              📈 Métricas de juegos
            </NavLink>
          </div>
        )}

        {/* Observabilidad — admin only */}
        {canAccessObservability && (
          <div className="mb-2">
            <p className="text-xs uppercase text-gray-500 px-3 mb-2 font-semibold tracking-wider">
              Sistema
            </p>
            <NavLink
              to="/backoffice/observability"
              className={navLinkClass}
              onClick={onNavigate}
            >
              🔭 Observabilidad
            </NavLink>
          </div>
        )}
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
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
      <aside className="hidden md:flex w-60 min-h-svh bg-[var(--color-bg-surface)] border-r border-white/10 flex-col px-4 py-6 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger + Sheet drawer */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-[var(--color-bg-surface)] border border-white/10"
            >
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 bg-[var(--color-bg-surface)] border-r border-white/10 flex flex-col px-4 py-6 p-0"
          >
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
