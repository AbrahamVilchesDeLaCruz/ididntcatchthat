const HOME_ENTERED_KEY = 'idct-home-entered';
const RETURN_TO_KEY = 'idct-return-to';
const LAST_ROUTE_KEY = 'idct-last-route';

const AUTHENTICATED_TRACKABLE_PREFIXES = [
  '/home',
  '/stats',
  '/ranking',
  '/profile',
  '/backoffice',
  '/game',
  '/study',
] as const;

export function hasHomeEntered(): boolean {
  return sessionStorage.getItem(HOME_ENTERED_KEY) === '1';
}

export function markHomeEntered(): void {
  sessionStorage.setItem(HOME_ENTERED_KEY, '1');
}

export function persistReturnTo(path: string): void {
  sessionStorage.setItem(RETURN_TO_KEY, path);
}

export function peekReturnTo(): string | null {
  return sessionStorage.getItem(RETURN_TO_KEY);
}

export function consumeReturnTo(): string | null {
  const value = sessionStorage.getItem(RETURN_TO_KEY);
  if (value) {
    sessionStorage.removeItem(RETURN_TO_KEY);
  }
  return value;
}

export function getLastRoute(): string | null {
  return sessionStorage.getItem(LAST_ROUTE_KEY);
}

export function shouldTrackAuthenticatedRoute(pathname: string): boolean {
  return AUTHENTICATED_TRACKABLE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

export function trackAuthenticatedRoute(pathname: string): void {
  if (!shouldTrackAuthenticatedRoute(pathname)) return;
  sessionStorage.setItem(LAST_ROUTE_KEY, pathname);
}

export function getPostAuthPath(options?: {
  returnTo?: string | null;
}): string {
  const returnTo = options?.returnTo ?? consumeReturnTo();
  if (returnTo) return returnTo;
  if (!hasHomeEntered()) return '/home';
  return getLastRoute() ?? '/home';
}
