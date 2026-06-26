import { type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BackofficeFlashcardsContainer } from '@/containers/backoffice/flashcards';
import { BackofficeGamesContainer } from '@/containers/backoffice/games';
import { BackofficeObservabilityContainer } from '@/containers/backoffice/observability';
import { useCurrentUser } from '@/core/auth/useCurrentUser';

const AdminFlashcardsRoute = (): ReactElement => {
  const { canManageFlashcards, canAccessBackoffice } = useCurrentUser();

  if (canManageFlashcards) {
    return <BackofficeFlashcardsContainer />;
  }

  if (canAccessBackoffice) {
    return <Navigate to="/backoffice/games" replace />;
  }

  return <Navigate to="/stats" replace />;
};

const AdminObservabilityRoute = (): ReactElement => {
  const { canAccessObservability } = useCurrentUser();

  if (!canAccessObservability) {
    return <Navigate to="/stats" replace />;
  }

  return <BackofficeObservabilityContainer />;
};

const BackofficeGamesRoute = (): ReactElement => {
  const { canAccessBackoffice } = useCurrentUser();

  if (!canAccessBackoffice) {
    return <Navigate to="/stats" replace />;
  }

  return <BackofficeGamesContainer />;
};

export const BackofficeView = (): ReactElement => {
  const { canAccessBackoffice, isAdmin } = useCurrentUser();

  return (
    <Routes>
      <Route path="flashcards" element={<AdminFlashcardsRoute />} />
      <Route path="games" element={<BackofficeGamesRoute />} />
      <Route path="observability" element={<AdminObservabilityRoute />} />
      <Route
        path="*"
        element={
          isAdmin ? (
            <Navigate to="flashcards" replace />
          ) : canAccessBackoffice ? (
            <Navigate to="games" replace />
          ) : (
            <Navigate to="/stats" replace />
          )
        }
      />
    </Routes>
  );
};
