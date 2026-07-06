import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '@/core/i18n';
import type { Locale, Translations } from '@/core/i18n/i18n.types';
import {
  buildCanonicalUrl,
  OG_LOCALE_ALTERNATE,
  OG_LOCALE_BY_UI_LOCALE,
  resolvePageMetaKey,
} from './pageMeta.config';
import { removeMeta, upsertLink, upsertMeta } from './headTags';

const OG_IMAGE = 'https://ididntcatchthat.com/og-image.png';

function applyPageMeta(
  pathname: string,
  locale: Locale,
  t: Translations,
): void {
  const key = resolvePageMetaKey(pathname);
  const page = t.seo.pages[key];

  document.title = page.title;

  upsertMeta('name', 'description', page.description);
  upsertMeta('name', 'robots', page.robots);

  if (page.robots.startsWith('index')) {
    upsertLink('canonical', buildCanonicalUrl(pathname));
  } else {
    document.head.querySelector('link[rel="canonical"]')?.remove();
  }

  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:site_name', t.seo.siteName);
  upsertMeta('property', 'og:title', page.title);
  upsertMeta('property', 'og:description', page.description);
  upsertMeta('property', 'og:url', buildCanonicalUrl(pathname));
  upsertMeta('property', 'og:image', OG_IMAGE);
  upsertMeta('property', 'og:locale', OG_LOCALE_BY_UI_LOCALE[locale]);
  upsertMeta('property', 'og:locale:alternate', OG_LOCALE_ALTERNATE[locale]);

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', page.title);
  upsertMeta('name', 'twitter:description', page.description);
  upsertMeta('name', 'twitter:image', OG_IMAGE);
}

export function usePageMeta(): void {
  const { pathname } = useLocation();
  const { locale, t } = useI18n();

  useEffect(() => {
    applyPageMeta(pathname, locale, t);

    return () => {
      removeMeta('property', 'og:locale:alternate');
    };
  }, [pathname, locale, t]);
}

/** @internal Exported for unit tests */
export { applyPageMeta };
