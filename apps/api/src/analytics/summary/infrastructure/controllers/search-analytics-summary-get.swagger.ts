import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseMetaSwagger {
  @ApiProperty({
    example: '2026-06-30T12:00:00.000Z',
    format: 'date-time',
  })
  timestamp: string;

  @ApiProperty({ example: 'req_abc123' })
  request_id: string;
}

export class AnalyticsSummaryTopPageSwagger {
  @ApiProperty({ example: '/games' })
  path: string;

  @ApiProperty({ example: 142 })
  views: number;
}

export class AnalyticsSummaryPageViewsByPeriodSwagger {
  @ApiProperty({ example: '01/06' })
  date: string;

  @ApiProperty({ example: 58 })
  views: number;

  @ApiProperty({ example: 41 })
  unique: number;
}

export class AnalyticsSummaryPageViewsSwagger {
  @ApiProperty({ example: 320 })
  total: number;

  @ApiProperty({ example: 210 })
  uniqueVisitors: number;

  @ApiProperty({ example: 45 })
  registeredVisitors: number;

  @ApiProperty({ example: 21.4, description: 'Percentage 0–100' })
  conversionRate: number;

  @ApiProperty({ type: [AnalyticsSummaryTopPageSwagger] })
  topPages: AnalyticsSummaryTopPageSwagger[];

  @ApiProperty({ type: [AnalyticsSummaryPageViewsByPeriodSwagger] })
  byPeriod: AnalyticsSummaryPageViewsByPeriodSwagger[];
}

export class AnalyticsSummaryGamesByPeriodSwagger {
  @ApiProperty({ example: '01/06' })
  date: string;

  @ApiProperty({ example: 12 })
  started: number;

  @ApiProperty({ example: 9 })
  completed: number;
}

export class AnalyticsSummaryGamesByModeSwagger {
  @ApiProperty({ example: 'game' })
  mode: string;

  @ApiProperty({ example: 87 })
  count: number;
}

export class AnalyticsSummaryGamesTopModuleSwagger {
  @ApiProperty({ example: 'native_sounds' })
  module: string;

  @ApiProperty({ example: 34 })
  count: number;
}

export class AnalyticsSummaryGamesSwagger {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 112 })
  completed: number;

  @ApiProperty({ example: 74.7, description: 'Percentage 0–100' })
  completionRate: number;

  @ApiProperty({ type: [AnalyticsSummaryGamesByPeriodSwagger] })
  byPeriod: AnalyticsSummaryGamesByPeriodSwagger[];

  @ApiProperty({ type: [AnalyticsSummaryGamesByModeSwagger] })
  byMode: AnalyticsSummaryGamesByModeSwagger[];

  @ApiProperty({ type: [AnalyticsSummaryGamesTopModuleSwagger] })
  topModules: AnalyticsSummaryGamesTopModuleSwagger[];
}

export class AnalyticsSummaryUsersByPeriodSwagger {
  @ApiProperty({ example: '01/06' })
  date: string;

  @ApiProperty({ example: 3 })
  count: number;
}

export class AnalyticsSummaryUsersByProviderSwagger {
  @ApiProperty({ example: 'email' })
  provider: string;

  @ApiProperty({ example: 18 })
  count: number;
}

export class AnalyticsSummaryUsersSwagger {
  @ApiProperty({ example: 12 })
  newRegistrations: number;

  @ApiProperty({ example: 64 })
  activeUsers: number;

  @ApiProperty({ type: [AnalyticsSummaryUsersByPeriodSwagger] })
  byPeriod: AnalyticsSummaryUsersByPeriodSwagger[];

  @ApiProperty({ type: [AnalyticsSummaryUsersByProviderSwagger] })
  byProvider: AnalyticsSummaryUsersByProviderSwagger[];
}

export class AnalyticsSummaryFlashcardsByPeriodSwagger {
  @ApiProperty({ example: '01/06' })
  date: string;

  @ApiProperty({ example: 2 })
  count: number;
}

export class AnalyticsSummaryFlashcardsAudioStatusSwagger {
  @ApiProperty({ example: 5 })
  pending: number;

  @ApiProperty({ example: 120 })
  done: number;

  @ApiProperty({ example: 1 })
  error: number;
}

export class AnalyticsSummaryFlashcardsByCategorySwagger {
  @ApiProperty({ example: 'native_sounds' })
  category: string;

  @ApiProperty({ example: 45 })
  count: number;
}

export class AnalyticsSummaryFlashcardsSwagger {
  @ApiProperty({ example: 126 })
  total: number;

  @ApiProperty({ example: 4 })
  createdInPeriod: number;

  @ApiProperty({ type: [AnalyticsSummaryFlashcardsByPeriodSwagger] })
  byPeriod: AnalyticsSummaryFlashcardsByPeriodSwagger[];

  @ApiProperty({ type: AnalyticsSummaryFlashcardsAudioStatusSwagger })
  audioStatus: AnalyticsSummaryFlashcardsAudioStatusSwagger;

  @ApiProperty({ type: [AnalyticsSummaryFlashcardsByCategorySwagger] })
  byCategory: AnalyticsSummaryFlashcardsByCategorySwagger[];
}

export class AnalyticsSummaryDataSwagger {
  @ApiProperty({
    enum: ['24h', '7d', '15d', '30d', '6m', 'all'],
    example: '7d',
  })
  period: string;

  @ApiProperty({ type: AnalyticsSummaryPageViewsSwagger })
  pageViews: AnalyticsSummaryPageViewsSwagger;

  @ApiProperty({ type: AnalyticsSummaryGamesSwagger })
  games: AnalyticsSummaryGamesSwagger;

  @ApiProperty({ type: AnalyticsSummaryUsersSwagger })
  users: AnalyticsSummaryUsersSwagger;

  @ApiProperty({ type: AnalyticsSummaryFlashcardsSwagger })
  flashcards: AnalyticsSummaryFlashcardsSwagger;
}

export class SearchAnalyticsSummaryEnvelopeSwagger {
  @ApiProperty({ type: AnalyticsSummaryDataSwagger })
  data: AnalyticsSummaryDataSwagger;

  @ApiProperty({ type: ApiResponseMetaSwagger })
  meta: ApiResponseMetaSwagger;
}
