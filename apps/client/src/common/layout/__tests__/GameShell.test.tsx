import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18n } from '@/core/i18n';
import { en } from '@/core/i18n/en';
import { useAuthStore } from '@/core/store/auth.store';
import { GameShell } from '../GameShell';

vi.mock('@/core/navigation/useSessionRouteTracking', () => ({
  useSessionRouteTracking: vi.fn(),
}));

vi.mock('@/core/auth/useCurrentUser', () => ({
  useCurrentUser: vi.fn(() => ({ canStudy: true })),
}));

describe('GameShell', () => {
  beforeEach(() => {
    useI18n.setState({ locale: 'en', t: en });
    useAuthStore.setState({ isAuthenticated: false });
  });

  it('logo links to /home when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/game']}>
        <Routes>
          <Route element={<GameShell />}>
            <Route path="/game" element={<div>Game page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const logoLink = screen.getByRole('link', { name: /catch/i });
    expect(logoLink).toHaveAttribute('href', '/home');
  });

  it('logo links to / when guest', () => {
    render(
      <MemoryRouter initialEntries={['/game']}>
        <Routes>
          <Route element={<GameShell />}>
            <Route path="/game" element={<div>Game page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const logoLink = screen.getByRole('link', { name: /catch/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('back navigates to /home when authenticated on game route', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/game']}>
        <Routes>
          <Route element={<GameShell />}>
            <Route path="/game" element={<div>Game page</div>} />
          </Route>
          <Route path="/home" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('allows horizontal scroll on narrow header actions without layout overflow', () => {
    render(
      <MemoryRouter initialEntries={['/game']}>
        <Routes>
          <Route element={<GameShell />}>
            <Route path="/game" element={<div>Game page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Game navigation')).toHaveClass(
      'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
    );
    expect(screen.getByRole('link', { name: en.gameShell.login })).toHaveClass(
      'shrink-0',
    );
  });

  it('shows a floating back button on active mobile play routes', () => {
    render(
      <MemoryRouter initialEntries={['/game/test-id']}>
        <Routes>
          <Route element={<GameShell />}>
            <Route path="/game/:gameId" element={<div>Active game</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('mobile-floating-back')).toHaveAttribute(
      'aria-label',
      en.gameShell.back,
    );
    expect(screen.getByText('Active game')).toBeInTheDocument();
  });
});
