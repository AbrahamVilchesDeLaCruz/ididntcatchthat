import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '@/identity/session/domain/user-session';
import { type UserSessionRepository } from '@/identity/session/domain/user-session.repository';
import { type Criteria, FilterOperator } from '@/shared/domain/criteria';
import { InvalidCriteriaField } from '@/identity/session/domain/exceptions/invalid-criteria-field';
import { UserSessionEntity } from './user-session.entity';

@Injectable()
export class TypeOrmUserSessionRepository implements UserSessionRepository {
  private readonly allowedFields: ReadonlySet<string> = new Set([
    'id',
    'tokenId',
    'ownerId',
    'ownerType',
    'deviceId',
    'fingerprint',
    'expiresAt',
    'revokedAt',
    'createdAt',
  ]);

  private readonly allowedOperators: ReadonlySet<FilterOperator> = new Set([
    FilterOperator.EQ,
    FilterOperator.NEQ,
    FilterOperator.LT,
    FilterOperator.LTE,
    FilterOperator.GT,
    FilterOperator.GTE,
  ]);

  constructor(
    @InjectRepository(UserSessionEntity)
    private readonly repo: Repository<UserSessionEntity>,
  ) {}

  async match(criteria: Criteria): Promise<UserSession[]> {
    const qb = this.repo.createQueryBuilder('us');

    for (const filter of criteria.filters) {
      if (!this.allowedFields.has(filter.field)) {
        throw new InvalidCriteriaField();
      }
      if (!this.allowedOperators.has(filter.operator)) {
        throw new InvalidCriteriaField();
      }
      const param = `p_${filter.field}`;
      qb.andWhere(`us.${filter.field} ${filter.operator} :${param}`, {
        [param]: filter.value,
      });
    }

    if (criteria.order) {
      if (!this.allowedFields.has(criteria.order.field)) {
        throw new InvalidCriteriaField();
      }
      qb.orderBy(`us.${criteria.order.field}`, criteria.order.direction);
    }

    if (criteria.limit !== null) qb.take(criteria.limit);
    if (criteria.offset !== null) qb.skip(criteria.offset);

    const entities = await qb.getMany();
    return entities.map((e) => this.toDomain(e));
  }

  async search(id: string): Promise<UserSession | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async save(session: UserSession): Promise<void> {
    await this.repo.save(this.toEntity(session));
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  private toDomain(entity: UserSessionEntity): UserSession {
    return UserSession.fromPrimitives({
      id: entity.id,
      tokenId: entity.tokenId,
      ownerId: entity.ownerId,
      ownerType: entity.ownerType,
      deviceId: entity.deviceId,
      fingerprint: entity.fingerprint,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
    });
  }

  private toEntity(session: UserSession): UserSessionEntity {
    const entity = new UserSessionEntity();
    const p = session.toPrimitives();
    entity.id = p.id;
    entity.tokenId = p.tokenId;
    entity.ownerId = p.ownerId;
    entity.ownerType = p.ownerType;
    entity.deviceId = p.deviceId;
    entity.fingerprint = p.fingerprint;
    entity.expiresAt = p.expiresAt;
    entity.revokedAt = p.revokedAt;
    entity.createdAt = p.createdAt;
    return entity;
  }
}
