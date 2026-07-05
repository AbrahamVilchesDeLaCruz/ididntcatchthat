export const SITE_ORIGIN = 'https://ididntcatchthat.com';

export type PageMetaKey =
  | 'landing'
  | 'authLogin'
  | 'authRegister'
  | 'authCallback'
  | 'gameConfig'
  | 'gameSession'
  | 'studyConfig'
  | 'studySession'
  | 'home'
  | 'profile'
  | 'stats'
  | 'ranking'
  | 'backoffice'
  | 'notFound';

export function resolvePageMetaKey(pathname: string): PageMetaKey {
  if (pathname === '/') return 'landing';
  if (pathname === '/auth/login') return 'authLogin';
  if (pathname === '/auth/register') return 'authRegister';
  if (pathname.startsWith('/auth/callback')) return 'authCallback';
  if (pathname === '/game') return 'gameConfig';
  if (pathname.startsWith('/game/')) return 'gameSession';
  if (pathname === '/study') return 'studyConfig';
  if (pathname.startsWith('/study/')) return 'studySession';
  if (pathname === '/home') return 'home';
  if (pathname === '/profile') return 'profile';
  if (pathname === '/stats') return 'stats';
  if (pathname === '/ranking') return 'ranking';
  if (pathname.startsWith('/backoffice')) return 'backoffice';
  return 'notFound';
}

export function buildCanonicalUrl(pathname: string): string {
  return `${SITE_ORIGIN}${pathname}`;
}

export const OG_LOCALE_BY_UI_LOCALE: Record<'en' | 'es', string> = {
  en: 'en_US',
  es: 'es_ES',
};

export const OG_LOCALE_ALTERNATE: Record<'en' | 'es', string> = {
  en: 'es_ES',
  es: 'en_US',
};
