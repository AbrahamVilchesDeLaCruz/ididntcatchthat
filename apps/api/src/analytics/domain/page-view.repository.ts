import { type PageView } from './page-view';

export interface PageViewRepository {
  save(pageView: PageView): Promise<void>;
}
