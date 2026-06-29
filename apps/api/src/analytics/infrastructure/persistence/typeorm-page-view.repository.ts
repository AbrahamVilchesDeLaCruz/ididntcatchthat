import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type PageViewRepository } from '@/analytics/application/record-page-view/page-view-repository';
import { PageViewEntity } from './page-view.entity';

@Injectable()
export class TypeOrmPageViewRepository implements PageViewRepository {
  constructor(
    @InjectRepository(PageViewEntity)
    private readonly repo: Repository<PageViewEntity>,
  ) {}

  async save(pageView: {
    path: string;
    visitorId: string;
    userId: string | null;
    referrer: string | null;
  }): Promise<void> {
    const entity = this.repo.create({
      path: pageView.path,
      visitorId: pageView.visitorId,
      userId: pageView.userId,
      referrer: pageView.referrer,
    });
    await this.repo.save(entity);
  }
}
