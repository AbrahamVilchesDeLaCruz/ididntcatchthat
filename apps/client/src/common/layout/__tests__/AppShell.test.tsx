import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/core/store/auth.store';

vi.mock('@/common/layout/AppSidebar', () => ({
  AppSidebar: () => <aside data-testid="app-sidebar" />,
}));

vi.mock('@/core/components/SkipToContentLink', () => ({
  SkipToContentLink: () => null,
}));

vi.mock('@/core/navigation/useSessionRouteTracking', () => ({
  useSessionRouteTracking: vi.fn(),
}));

vi.mock('@/core/auth/useCurrentUser', () => ({
  useCurrentUser: vi.fn(() => ({
    canManageFlashcards: false,
    canAccessBackoffice: false,
  })),
}));

import { AppShell } from '../AppShell';

const resetStore = (): void => {
  useAuthStore.setState({
    accessToken: null,
    isAuthenticated: false,
    isLogoutPending: false,
    guestDeviceId: null,
    userType: null,
    userId: null,
    roles: [],
  });
};

const renderWithRoutes = (initialPath: string): void => {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/home" element={<div>home content</div>} />
        </Route>
        <Route path="/auth/login" element={<div>login page</div>} />
        <Route path="/" element={<div>landing page</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('AppShell', () => {
  beforeEach(resetStore);

  it('muestra el contenido cuando el usuario está autenticado', () => {
    useAuthStore.setState({ isAuthenticated: true });
    renderWithRoutes('/home');
    expect(screen.getByText('home content')).toBeInTheDocument();
  });

  it('redirige a /auth/login cuando el usuario NO está autenticado y NO hay logout pendiente', () => {
    renderWithRoutes('/home');
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('redirige a / (landing) cuando el usuario acaba de hacer logout (isLogoutPending=true)', () => {
    useAuthStore.setState({ isAuthenticated: false, isLogoutPending: true });
    renderWithRoutes('/home');
    expect(screen.getByText('landing page')).toBeInTheDocument();
  });

  it('NO redirige a /auth/login cuando hay logout pendiente', () => {
    useAuthStore.setState({ isAuthenticated: false, isLogoutPending: true });
    renderWithRoutes('/home');
    expect(screen.queryByText('login page')).not.toBeInTheDocument();
  });
});
