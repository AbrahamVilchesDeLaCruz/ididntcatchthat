import { type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BackofficeFlashcardsContainer } from '@/containers/backoffice/flashcards';
import { BackofficeGamesContainer } from '@/containers/backoffice/games';
import { BackofficeObservabilityContainer } from '@/containers/backoffice/observability';
import { useCurrentUser } from '@/core/auth/useCurrentUser';

export const BackofficeView = (): ReactElement => {
  const { canAccessBackoffice } = useCurrentUser();

  return (
    <Routes>
      <Route path="flashcards" element={<BackofficeFlashcardsContainer />} />
      <Route path="games" element={<BackofficeGamesContainer />} />
      <Route
        path="observability"
        element={<BackofficeObservabilityContainer />}
      />
      <Route
        path="*"
        element={
          canAccessBackoffice ? (
            <Navigate to="flashcards" replace />
          ) : (
            <Navigate to="/stats" replace />
          )
        }
      />
    </Routes>
  );
};
