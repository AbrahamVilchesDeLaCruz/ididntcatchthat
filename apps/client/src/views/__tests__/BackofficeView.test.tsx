import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import { BackofficeView } from '../BackofficeView';

vi.mock('@/core/auth/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('@/containers/backoffice/flashcards', () => ({
  BackofficeFlashcardsContainer: () => <div>Flashcards admin</div>,
}));

vi.mock('@/containers/backoffice/games', () => ({
  BackofficeGamesContainer: () => <div>Games admin</div>,
}));

vi.mock('@/containers/backoffice/users', () => ({
  BackofficeUsersContainer: () => <div>Users admin</div>,
}));

vi.mock('@/containers/backoffice/observability', () => ({
  BackofficeObservabilityContainer: () => <div>Observability admin</div>,
}));

const mockedUseCurrentUser = vi.mocked(useCurrentUser);

function renderBackoffice(
  initialEntry = '/backoffice',
): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/backoffice/*" element={<BackofficeView />} />
        <Route path="/stats" element={<div>Stats page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('BackofficeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects admins from index to flashcards', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: true,
      canAccessBackoffice: true,
      canManageFlashcards: true,
      canAccessObservability: true,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice');

    expect(screen.getByText('Flashcards admin')).toBeInTheDocument();
  });

  it('redirects non-admin backoffice users from index to games', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: false,
      canAccessBackoffice: true,
      canManageFlashcards: false,
      canAccessObservability: false,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice');

    expect(screen.getByText('Games admin')).toBeInTheDocument();
  });

  it('redirects users without backoffice access to stats', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: false,
      canAccessBackoffice: false,
      canManageFlashcards: false,
      canAccessObservability: false,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice');

    expect(screen.getByText('Stats page')).toBeInTheDocument();
  });

  it('redirects flashcard route to games when user cannot manage flashcards', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: false,
      canAccessBackoffice: true,
      canManageFlashcards: false,
      canAccessObservability: false,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice/flashcards');

    expect(screen.getByText('Games admin')).toBeInTheDocument();
  });

  it('redirects flashcard route to stats without any backoffice access', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: false,
      canAccessBackoffice: false,
      canManageFlashcards: false,
      canAccessObservability: false,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice/flashcards');

    expect(screen.getByText('Stats page')).toBeInTheDocument();
  });

  it('redirects observability route to stats when access is denied', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: true,
      canAccessBackoffice: true,
      canManageFlashcards: true,
      canAccessObservability: false,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice/observability');

    expect(screen.getByText('Stats page')).toBeInTheDocument();
  });

  it('renders observability when access is granted', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: true,
      canAccessBackoffice: true,
      canManageFlashcards: true,
      canAccessObservability: true,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice/observability');

    expect(screen.getByText('Observability admin')).toBeInTheDocument();
  });

  it('redirects games route to stats without backoffice access', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: false,
      canAccessBackoffice: false,
      canManageFlashcards: false,
      canAccessObservability: false,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice/games');

    expect(screen.getByText('Stats page')).toBeInTheDocument();
  });

  it('redirects unknown backoffice paths for admins to flashcards', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: true,
      canAccessBackoffice: true,
      canManageFlashcards: true,
      canAccessObservability: true,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice/unknown-section');

    expect(screen.getByText('Flashcards admin')).toBeInTheDocument();
  });

  it('renders users admin when backoffice access is granted', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: false,
      canAccessBackoffice: true,
      canManageFlashcards: false,
      canAccessObservability: false,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice/users');

    expect(screen.getByText('Users admin')).toBeInTheDocument();
  });

  it('redirects users route to stats without backoffice access', () => {
    mockedUseCurrentUser.mockReturnValue({
      isAdmin: false,
      canAccessBackoffice: false,
      canManageFlashcards: false,
      canAccessObservability: false,
    } as ReturnType<typeof useCurrentUser>);

    renderBackoffice('/backoffice/users');

    expect(screen.getByText('Stats page')).toBeInTheDocument();
  });
});
