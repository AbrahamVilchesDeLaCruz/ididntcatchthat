import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageViewEntity } from '../persistence/page-view.entity';
import { TypeOrmPageViewRepository } from '../persistence/typeorm-page-view.repository';
import { TypeOrmDbStatsQuery } from '../persistence/typeorm-db-stats.query';
import { RecordPageViewUseCase } from '@/analytics/application/record-page-view/record-page-view.use-case';
import { DbStatsRetriever } from '@/analytics/application/db-stats/db-stats-retriever';
import { RecordPageViewController } from '../controllers/record-page-view.controller';
import { AdminDbStatsGetController } from '../controllers/admin-db-stats-get.controller';
import { ANALYTICS_TOKENS } from './analytics.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([PageViewEntity])],
  controllers: [RecordPageViewController, AdminDbStatsGetController],
  providers: [
    RecordPageViewUseCase,
    DbStatsRetriever,
    {
      provide: ANALYTICS_TOKENS.PAGE_VIEW_REPOSITORY,
      useClass: TypeOrmPageViewRepository,
    },
    {
      provide: ANALYTICS_TOKENS.DB_STATS_QUERY,
      useClass: TypeOrmDbStatsQuery,
    },
  ],
})
export class AnalyticsModule {}
