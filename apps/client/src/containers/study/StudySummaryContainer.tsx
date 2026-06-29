import { type ReactElement, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProgressSummary } from '@/containers/stats/api/stats.api';
import { StudySummaryComponent } from './StudySummaryComponent';
import type { StudySummaryVM } from './study.types';

interface LocationState {
  summary?: StudySummaryVM;
}

export const StudySummaryContainer = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const summary = state.summary;

  const { data: progressSummary } = useProgressSummary(true);

  useEffect(() => {
    if (!summary) {
      void navigate('/study', { replace: true });
    }
  }, [navigate, summary]);

  if (!summary) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg-base)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <StudySummaryComponent
      summary={summary}
      currentStreak={progressSummary?.currentStreak ?? 0}
      onStudyAgain={() => void navigate('/study')}
      onPlayGame={() => void navigate('/game')}
    />
  );
};
