import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { apiClient } from '@/core/api/apiClient';

const VISITOR_ID_KEY = 'ididntcatchthat_vid';

function getOrCreateVisitorId(): string {
  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(VISITOR_ID_KEY, id);
  return id;
}

export function usePageView(): void {
  const location = useLocation();
  const userId = useAuthStore((s) => s.userId);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    apiClient
      .post('/analytics/page-views', {
        path: location.pathname,
        visitorId,
        userId: userId ?? null,
        referrer: document.referrer || null,
      })
      .catch(() => {
        // intentionally silent — page view recording should never break UX
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
