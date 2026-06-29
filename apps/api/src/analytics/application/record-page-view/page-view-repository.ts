export interface PageViewRepository {
  save(pageView: {
    path: string;
    visitorId: string;
    userId: string | null;
    referrer: string | null;
  }): Promise<void>;
}
