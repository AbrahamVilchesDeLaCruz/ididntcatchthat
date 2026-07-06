import { usePageMeta } from './usePageMeta';

/** Syncs document head tags with the active route and locale. */
export const PageMetaManager = (): null => {
  usePageMeta();
  return null;
};
