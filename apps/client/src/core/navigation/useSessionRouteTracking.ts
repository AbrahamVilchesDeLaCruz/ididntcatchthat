import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { trackAuthenticatedRoute } from '@/core/navigation/sessionNav';

export function useSessionRouteTracking(): void {
  const pathname = useLocation().pathname;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    trackAuthenticatedRoute(pathname);
  }, [isAuthenticated, pathname]);
}
