export interface AnalyticsSummaryApiModel {
  period: string;
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
    activeUsers: number;
    byPeriod: { date: string; count: number }[];
    byProvider: { provider: string; count: number }[];
  };
  flashcards: {
    total: number;
    createdInPeriod: number;
    byPeriod: { date: string; count: number }[];
    audioStatus: { pending: number; done: number; error: number };
    byCategory: { category: string; count: number }[];
  };
}
