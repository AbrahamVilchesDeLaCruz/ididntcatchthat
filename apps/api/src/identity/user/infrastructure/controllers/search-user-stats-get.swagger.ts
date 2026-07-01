import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseMetaSwagger } from '@/shared/infrastructure/http/response/api-response-meta.swagger';

export class UserStatsByPeriodSwagger {
  @ApiProperty({ example: '01/06' })
  date: string;

  @ApiProperty({ example: 3 })
  count: number;
}

export class UserStatsByProviderSwagger {
  @ApiProperty({ example: 'email' })
  provider: string;

  @ApiProperty({ example: 18 })
  count: number;
}

export class SearchUserStatsDataSwagger {
  @ApiProperty({
    enum: ['24h', '7d', '15d', '30d', '6m', 'all'],
    example: '7d',
  })
  period: string;

  @ApiProperty({ example: 256 })
  totalUsers: number;

  @ApiProperty({ example: 48 })
  googleUsers: number;

  @ApiProperty({ example: 208 })
  emailUsers: number;

  @ApiProperty({ example: 72 })
  usersWithStreak: number;

  @ApiProperty({ example: 4.2 })
  avgLongestStreak: number;

  @ApiProperty({ example: 31 })
  neverPlayed: number;

  @ApiProperty({ example: 12 })
  newRegistrations: number;

  @ApiProperty({ example: 64 })
  activeUsers: number;

  @ApiProperty({ example: 25.0, description: 'Percentage 0–100' })
  engagementRate: number;

  @ApiProperty({ type: [UserStatsByProviderSwagger] })
  byProvider: UserStatsByProviderSwagger[];

  @ApiProperty({ type: [UserStatsByPeriodSwagger] })
  byPeriod: UserStatsByPeriodSwagger[];
}

export class SearchUserStatsEnvelopeSwagger {
  @ApiProperty({ type: SearchUserStatsDataSwagger })
  data: SearchUserStatsDataSwagger;

  @ApiProperty({ type: ApiResponseMetaSwagger })
  meta: ApiResponseMetaSwagger;
}
