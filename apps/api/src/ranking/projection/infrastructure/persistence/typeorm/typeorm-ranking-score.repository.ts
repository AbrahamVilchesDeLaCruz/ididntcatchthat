import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import { RankingScore } from '@/ranking/projection/domain/ranking-score';
import { RankingId } from '@/ranking/projection/domain/ranking-id';
import { type RankingScoreRepository } from '@/ranking/projection/domain/ranking-score.repository';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import { RankingUserScoreEntity } from '@/ranking/projection/infrastructure/persistence/typeorm/ranking-user-score.entity';

@Injectable()
export class TypeOrmRankingScoreRepository implements RankingScoreRepository {
  private readonly allowedFields: ReadonlySet<string> = new Set([
    'userId',
    'type',
    'period',
    'periodBucket',
    'module',
    'score',
  ]);

  constructor(
    @InjectRepository(RankingUserScoreEntity)
    private readonly repo: Repository<RankingUserScoreEntity>,
  ) {}

  async search(id: RankingId): Promise<RankingScore | null> {
    const entity = await this.repo.findOneBy({
      userId: id.userId.value,
      type: id.type.value,
      period: id.period.value,
      periodBucket: id.periodBucket,
      module: id.module,
    });

    return entity ? this.toDomain(entity) : null;
  }

  async match(criteria: Criteria): Promise<RankingScore[]> {
    const qb = this.repo.createQueryBuilder('r');
    this.applyFilters(qb, criteria);

    if (criteria.order) {
      qb.orderBy(`r.${criteria.order.field}`, criteria.order.direction);
    }

    if (criteria.limit !== null) qb.take(criteria.limit);
    if (criteria.offset !== null) qb.skip(criteria.offset);

    const entities = await qb.getMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async save(score: RankingScore): Promise<void> {
    await this.repo.save(this.toEntity(score));
  }

  async remove(id: RankingId): Promise<void> {
    await this.repo.delete({
      userId: id.userId.value,
      type: id.type.value,
      period: id.period.value,
      periodBucket: id.periodBucket,
      module: id.module,
    });
  }

  private applyFilters(
    qb: SelectQueryBuilder<RankingUserScoreEntity>,
    criteria: Criteria,
  ): void {
    for (const filter of criteria.filters) {
      if (!this.allowedFields.has(filter.field)) {
        throw new Error(`Invalid criteria field: ${filter.field}`);
      }

      const param = `p_${filter.field}`;
      if (filter.value === null) {
        if (filter.operator === FilterOperator.EQ) {
          qb.andWhere(`r.${filter.field} IS NULL`);
        } else {
          qb.andWhere(`r.${filter.field} IS NOT NULL`);
        }
      } else {
        qb.andWhere(`r.${filter.field} ${filter.operator} :${param}`, {
          [param]: filter.value,
        });
      }
    }
  }

  private toDomain(entity: RankingUserScoreEntity): RankingScore {
    return RankingScore.fromPrimitives({
      userId: entity.userId,
      type: entity.type,
      period: entity.period,
      periodBucket: entity.periodBucket,
      module: entity.module,
      nickname: entity.nickname,
      score: Number(entity.score),
    });
  }

  private toEntity(score: RankingScore): RankingUserScoreEntity {
    const p = score.toPrimitives();
    const entity = new RankingUserScoreEntity();
    entity.userId = p.userId;
    entity.type = p.type;
    entity.period = p.period;
    entity.periodBucket = p.periodBucket;
    entity.module = p.module;
    entity.nickname = p.nickname;
    entity.score = String(p.score);
    return entity;
  }
}
