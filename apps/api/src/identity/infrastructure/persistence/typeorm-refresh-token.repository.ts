import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '@/identity/domain/refresh-token';
import { type RefreshTokenRepository } from '@/identity/domain/refresh-token.repository';
import { type Criteria } from '@/shared/domain/criteria';
import { RefreshTokenEntity } from './refresh-token.entity';

@Injectable()
export class TypeOrmRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly repo: Repository<RefreshTokenEntity>,
  ) {}

  async match(criteria: Criteria): Promise<RefreshToken[]> {
    const qb = this.repo.createQueryBuilder('rt');

    for (const filter of criteria.filters) {
      const param = `p_${filter.field}`;
      qb.andWhere(`rt.${filter.field} ${filter.operator} :${param}`, {
        [param]: filter.value,
      });
    }

    if (criteria.order) {
      qb.orderBy(`rt.${criteria.order.field}`, criteria.order.direction);
    }

    if (criteria.limit !== null) qb.take(criteria.limit);
    if (criteria.offset !== null) qb.skip(criteria.offset);

    const entities = await qb.getMany();
    return entities.map((e) => this.toDomain(e));
  }

  async search(id: string): Promise<RefreshToken | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async save(token: RefreshToken): Promise<void> {
    await this.repo.save(this.toEntity(token));
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  private toDomain(entity: RefreshTokenEntity): RefreshToken {
    return RefreshToken.fromPrimitives({
      id: entity.id,
      tokenId: entity.tokenId,
      userId: entity.userId ?? entity.deviceId, // guests: fallback to deviceId
      deviceId: entity.deviceId,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
    });
  }

  private toEntity(token: RefreshToken): RefreshTokenEntity {
    const entity = new RefreshTokenEntity();
    const p = token.toPrimitives();
    entity.id = p.id;
    entity.tokenId = p.tokenId;
    // guests store deviceId as userId in domain — persist as NULL in DB (no FK row)
    entity.userId = p.userId === p.deviceId ? null : p.userId;
    entity.deviceId = p.deviceId;
    entity.expiresAt = p.expiresAt;
    entity.revokedAt = p.revokedAt;
    entity.createdAt = p.createdAt;
    return entity;
  }
}
