import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashcard } from '@/content/flashcard/domain/flashcard';
import { type FlashcardId } from '@/content/flashcard/domain/flashcard-id';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type Criteria } from '@/shared/domain/criteria';
import { FlashcardEntity } from './flashcard.entity';

@Injectable()
export class TypeOrmFlashcardRepository implements FlashcardRepository {
  constructor(
    @InjectRepository(FlashcardEntity)
    private readonly repo: Repository<FlashcardEntity>,
  ) {}

  async match(criteria: Criteria): Promise<Flashcard[]> {
    const qb = this.repo.createQueryBuilder('f');

    for (const filter of criteria.filters) {
      const param = `p_${filter.field}`;
      qb.andWhere(`f.${filter.field} ${filter.operator} :${param}`, {
        [param]: filter.value,
      });
    }

    if (criteria.order) {
      qb.orderBy(`f.${criteria.order.field}`, criteria.order.direction);
    }

    if (criteria.limit !== null) qb.take(criteria.limit);
    if (criteria.offset !== null) qb.skip(criteria.offset);

    const entities = await qb.getMany();
    return entities.map((e) => this.toDomain(e));
  }

  async count(criteria: Criteria): Promise<number> {
    const qb = this.repo.createQueryBuilder('f');

    for (const filter of criteria.filters) {
      const param = `p_${filter.field}`;
      qb.andWhere(`f.${filter.field} ${filter.operator} :${param}`, {
        [param]: filter.value,
      });
    }

    return qb.getCount();
  }

  async search(id: FlashcardId): Promise<Flashcard | null> {
    const entity = await this.repo.findOneBy({ id: id.value });
    return entity ? this.toDomain(entity) : null;
  }

  async save(flashcard: Flashcard): Promise<void> {
    await this.repo.save(this.toEntity(flashcard));
  }

  async remove(id: FlashcardId): Promise<void> {
    await this.repo.delete({ id: id.value });
  }

  private toDomain(entity: FlashcardEntity): Flashcard {
    return Flashcard.fromPrimitives({
      id: entity.id,
      expression: entity.expression,
      meaning: entity.meaning,
      category: entity.category,
      subcategory: entity.subcategory,
      ipaNotation: entity.ipaNotation,
      nativeSpeech: entity.nativeSpeech,
      audioStatus: entity.audioStatus,
      audioUrls: entity.audioUrls,
      examples: entity.examples,
      createdBy: entity.createdBy,
    });
  }

  private toEntity(flashcard: Flashcard): FlashcardEntity {
    const entity = new FlashcardEntity();
    const p = flashcard.toPrimitives();
    entity.id = p.id;
    entity.expression = p.expression;
    entity.meaning = p.meaning;
    entity.category = p.category;
    entity.subcategory = p.subcategory;
    entity.ipaNotation = p.ipaNotation;
    entity.nativeSpeech = p.nativeSpeech;
    entity.audioStatus = p.audioStatus;
    entity.audioUrls = p.audioUrls;
    entity.examples = p.examples;
    entity.createdBy = p.createdBy;
    return entity;
  }
}
