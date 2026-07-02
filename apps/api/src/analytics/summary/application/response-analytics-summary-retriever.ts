export type SummaryPeriod = '24h' | '7d' | '15d' | '30d' | '6m' | 'all';

export interface ResponseAnalyticsSummaryRetriever {
  period: SummaryPeriod;
  pageViews: {
    total: number;
    uniqueVisitors: number;
    registeredVisitors: number;
    conversionRate: number;
    topPages: { path: string; views: number }[];
    byPeriod: { date: string; views: number; unique: number }[];
  };
  games: {
    total: number;
    completed: number;
    completionRate: number;
    byPeriod: { date: string; started: number; completed: number }[];
    byMode: { mode: string; count: number }[];
    topModules: { module: string; count: number }[];
  };
  users: {
    newRegistrations: number;
    byPeriod: { date: string; count: number }[];
    byProvider: { provider: string; count: number }[];
    activeUsers: number;
  };
  flashcards: {
    total: number;
    createdInPeriod: number;
    byPeriod: { date: string; count: number }[];
    audioStatus: { pending: number; done: number; error: number };
    byCategory: { category: string; count: number }[];
  };
}
