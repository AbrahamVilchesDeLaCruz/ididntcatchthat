import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'node:path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ObservabilityModule } from './observability/infrastructure/framework/observability.module';
import { SharedModule } from './shared/infrastructure/framework/shared.module';
import { IdentityModule } from './identity/shared/infrastructure/framework/identity.module';
import { ContentModule } from './content/shared/infrastructure/framework/content.module';
import { GamingModule } from './gaming/infrastructure/framework/gaming.module';
import { ProgressModule } from './progress/infrastructure/framework/progress.module';
import { RankingModule } from './ranking/shared/infrastructure/framework/ranking.module';
import { AchievementModule } from './achievement/shared/infrastructure/framework/achievement.module';
import { AnalyticsModule } from './analytics/shared/infrastructure/framework/analytics.module';
import { buildTypeOrmDataSourceOptions } from './shared/infrastructure/persistence/typeorm/typeorm-data-source-options';
import { envValidationSchema } from './shared/infrastructure/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env.local'),
        join(process.cwd(), '.env'),
      ],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => buildTypeOrmDataSourceOptions(),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000, // 1 minute window
        limit: 100, // 100 req/min global — generous for normal use
        skipIf: (): boolean => process.env.NODE_ENV === 'test',
      },
      {
        name: 'auth',
        ttl: 60_000, // 1 minute window
        limit: 10, // 10 req/min for auth endpoints — prevents brute force
        skipIf: (): boolean => process.env.NODE_ENV === 'test',
      },
    ]),
    SharedModule,
    ObservabilityModule,
    IdentityModule,
    ContentModule,
    GamingModule,
    ProgressModule,
    RankingModule,
    AchievementModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
