import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';
import { PAGE_VIEW_REPOSITORY } from '@/analytics/page-view/domain/page-view.repository';
import { PageViewRecorder } from '@/analytics/page-view/application/page-view-recorder';
import { PageViewEntity } from '@/analytics/page-view/infrastructure/persistence/page-view.entity';
import { TypeOrmPageViewRepository } from '@/analytics/page-view/infrastructure/persistence/typeorm-page-view.repository';
import { RecordPageViewPostController } from '@/analytics/page-view/infrastructure/controllers/record-page-view-post.controller';
import { ANALYTICS_SUMMARY_QUERY } from '@/analytics/summary/application/analytics-summary.query';
import { AnalyticsSummaryRetriever } from '@/analytics/summary/application/analytics-summary-retriever';
import { TypeOrmAnalyticsSummaryQuery } from '@/analytics/summary/infrastructure/persistence/typeorm-analytics-summary.query';
import { SearchAnalyticsSummaryGetController } from '@/analytics/summary/infrastructure/controllers/search-analytics-summary-get.controller';
import { AnalyticsExceptionRegistry } from './analytics-exception-registry';

@Module({
  imports: [TypeOrmModule.forFeature([PageViewEntity]), AuthModule],
  controllers: [
    RecordPageViewPostController,
    SearchAnalyticsSummaryGetController,
  ],
  providers: [
    PageViewRecorder,
    AnalyticsSummaryRetriever,
    AnalyticsExceptionRegistry,
    {
      provide: PAGE_VIEW_REPOSITORY,
      useClass: TypeOrmPageViewRepository,
    },
    {
      provide: ANALYTICS_SUMMARY_QUERY,
      useClass: TypeOrmAnalyticsSummaryQuery,
    },
  ],
})
export class AnalyticsModule {}
