import { type ReactElement } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuthBootstrap } from '@/core/auth/useAuthBootstrap';
import { usePageView } from '@/core/analytics/usePageView';
import { useI18n } from '@/core/i18n';
import { AppShell } from '@/common/layout/AppShell';
import { GameShell } from '@/common/layout/GameShell';
import { LandingView } from '@/views/LandingView';
import { AuthView } from '@/views/AuthView';
import { AuthCallbackView } from '@/views/AuthCallbackView';
import { BackofficeView } from '@/views/BackofficeView';
import { StatsView } from '@/views/StatsView';
import { RankingView } from '@/views/RankingView';
import { GameConfigView } from '@/views/GameConfigView';
import { GameView } from '@/views/GameView';
import { GameSummaryView } from '@/views/GameSummaryView';
import { StudyConfigView } from '@/views/StudyConfigView';
import { StudyView } from '@/views/StudyView';
import { StudySummaryView } from '@/views/StudySummaryView';
import { HomeView } from '@/views/HomeView';
import { ProfileView } from '@/views/ProfileView';
import { FallbackRedirect } from '@/core/router/FallbackRedirect';

const AppRoutes = (): ReactElement => {
  const ready = useAuthBootstrap();
  const { t } = useI18n();
  usePageView();

  if (!ready) {
    return (
      <div
        className="min-h-svh bg-[var(--color-bg-base)] flex items-center justify-center"
        aria-busy="true"
      >
        <div
          className="w-6 h-6 rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-text-secondary)] animate-spin"
          role="status"
          aria-label={t.common.loading}
        />
      </div>
    );
  }

  return (
    <Routes>
      {/* ── Standalone (sin shell) ─────────────────────────────────────────── */}
      <Route path="/" element={<LandingView />} />
      <Route path="/auth/callback" element={<AuthCallbackView />} />
      <Route path="/auth/:mode" element={<AuthView />} />

      {/* ── Game shell (topbar slim, sin sidebar, público) ─────────────────── */}
      <Route element={<GameShell />}>
        <Route path="/game" element={<GameConfigView />} />
        <Route path="/game/:gameId" element={<GameView />} />
        <Route path="/game/:gameId/summary" element={<GameSummaryView />} />
        <Route path="/study" element={<StudyConfigView />} />
        <Route path="/study/:sessionId" element={<StudyView />} />
        <Route
          path="/study/:sessionId/summary"
          element={<StudySummaryView />}
        />
      </Route>

      {/* ── App shell (sidebar, protegido — redirige a /auth/login) ────────── */}
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomeView />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/stats" element={<StatsView />} />
        <Route path="/ranking" element={<RankingView />} />
        <Route path="/backoffice/*" element={<BackofficeView />} />
      </Route>

      {/* ── Fallback ───────────────────────────────────────────────────────── */}
      <Route path="*" element={<FallbackRedirect />} />
    </Routes>
  );
};

export const AppRouter = (): ReactElement => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};
