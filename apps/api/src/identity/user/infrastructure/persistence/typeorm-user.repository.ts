import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/identity/user/domain/user';
import { UserId } from '@/shared/domain/user-id';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { type Criteria } from '@/shared/domain/criteria';
import { UserEntity } from './user.entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async match(criteria: Criteria): Promise<User[]> {
    const qb = this.repo.createQueryBuilder('u');

    for (const filter of criteria.filters) {
      const param = `p_${filter.field}`;
      qb.andWhere(`u.${filter.field} ${filter.operator} :${param}`, {
        [param]: filter.value,
      });
    }

    if (criteria.order) {
      qb.orderBy(`u.${criteria.order.field}`, criteria.order.direction);
    }

    if (criteria.limit !== null) qb.take(criteria.limit);
    if (criteria.offset !== null) qb.skip(criteria.offset);

    const entities = await qb.getMany();
    return entities.map((e) => this.toDomain(e));
  }

  async search(id: UserId): Promise<User | null> {
    const entity = await this.repo.findOneBy({ id: id.value });
    return entity ? this.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    await this.repo.save(this.toEntity(user));
  }

  async remove(id: UserId): Promise<void> {
    await this.repo.delete({ id: id.value });
  }

  async findWithStaleStreak(beforeDate: Date): Promise<User[]> {
    const before = beforeDate.toISOString().slice(0, 10);
    const entities = await this.repo
      .createQueryBuilder('u')
      .where('u.current_streak > 0')
      .andWhere('u.last_activity_date IS NOT NULL')
      .andWhere('u.last_activity_date < :before', { before })
      .getMany();

    return entities.map((e) => this.toDomain(e));
  }

  private toDomain(entity: UserEntity): User {
    return User.fromPrimitives({
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      nickname: entity.nickname,
      avatarUrl: entity.avatarUrl,
      role: entity.role,
      oauthProvider: entity.oauthProvider,
      showInRanking: entity.showInRanking,
      currentStreak: entity.currentStreak,
      longestStreak: entity.longestStreak,
      lastActivityDate: entity.lastActivityDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    const p = user.toPrimitives();
    entity.id = p.id;
    entity.email = p.email;
    entity.passwordHash = p.passwordHash;
    entity.nickname = p.nickname;
    entity.avatarUrl = p.avatarUrl;
    entity.role = p.role;
    entity.oauthProvider = p.oauthProvider;
    entity.showInRanking = p.showInRanking;
    entity.currentStreak = p.currentStreak;
    entity.longestStreak = p.longestStreak;
    entity.lastActivityDate = p.lastActivityDate;
    entity.createdAt = p.createdAt;
    entity.updatedAt = p.updatedAt;
    return entity;
  }
}
