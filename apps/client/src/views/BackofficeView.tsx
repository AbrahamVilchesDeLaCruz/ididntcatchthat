import { type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BackofficeSidebar } from '@/layout/BackofficeSidebar';
import { BackofficeFlashcardsContainer } from '@/containers/backoffice/flashcards';

export const BackofficeView = (): ReactElement => {
  return (
    <div className="flex min-h-svh bg-[var(--color-bg-base)]">
      <BackofficeSidebar />
      <main className="flex-1 p-8">
        <Routes>
          <Route
            path="flashcards"
            element={<BackofficeFlashcardsContainer />}
          />
          <Route path="*" element={<Navigate to="flashcards" replace />} />
        </Routes>
      </main>
    </div>
  );
};
