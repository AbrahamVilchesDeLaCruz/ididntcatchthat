import { type ReactElement } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useLogout } from '@/containers/auth/api';

export const BackofficeSidebar = (): ReactElement => {
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
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-white/10 text-white'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <aside className="w-60 min-h-svh bg-[var(--color-bg-surface,#1a1a2e)] border-r border-white/10 flex flex-col px-4 py-6">
      {/* Logo */}
      <Link to="/" className="text-white font-bold text-lg mb-8 px-3">
        ididntcatchthat
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <p className="text-xs uppercase text-gray-500 px-3 mb-2 font-semibold tracking-wider">
          Backoffice
        </p>
        <NavLink to="/backoffice/flashcards" className={navLinkClass}>
          Flashcards
        </NavLink>

        <div className="pt-4">
          <p className="text-xs uppercase text-gray-500 px-3 mb-2 font-semibold tracking-wider">
            Game
          </p>
          <NavLink to="/game" className={navLinkClass}>
            🎮 Play
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        Cerrar sesión
      </button>
    </aside>
  );
};
