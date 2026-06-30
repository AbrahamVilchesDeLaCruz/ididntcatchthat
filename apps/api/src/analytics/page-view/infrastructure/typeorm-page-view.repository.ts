import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type PageViewRepository } from '@/analytics/page-view/domain/page-view.repository';
import { type PageView } from '@/analytics/page-view/domain/page-view';
import { PageViewEntity } from './page-view.entity';

@Injectable()
export class TypeOrmPageViewRepository implements PageViewRepository {
  constructor(
    @InjectRepository(PageViewEntity)
    private readonly repo: Repository<PageViewEntity>,
  ) {}

  async save(pageView: PageView): Promise<void> {
    const primitives = pageView.toPrimitives();
    const entity = this.repo.create({
      id: primitives.id,
      path: primitives.path,
      visitorId: primitives.visitorId,
      userId: primitives.userId,
      referrer: primitives.referrer,
      createdAt: primitives.recordedAt,
    });
    await this.repo.save(entity);
  }
}
