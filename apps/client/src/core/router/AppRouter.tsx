import { type ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthBootstrap } from '@/core/auth/useAuthBootstrap';
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

const AppRoutes = (): ReactElement => {
  const ready = useAuthBootstrap();

  if (!ready) {
    return (
      <div className="min-h-svh bg-[var(--color-bg-base)] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
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
      </Route>

      {/* ── App shell (sidebar, protegido — redirige a /auth/login) ────────── */}
      <Route element={<AppShell />}>
        <Route path="/stats" element={<StatsView />} />
        <Route path="/ranking" element={<RankingView />} />
        <Route path="/backoffice/*" element={<BackofficeView />} />
      </Route>

      {/* ── Fallback ───────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
