import { type PageView } from './page-view';

export interface PageViewRepository {
  save(pageView: PageView): Promise<void>;
}

export const PAGE_VIEW_REPOSITORY = Symbol('PageViewRepository');
