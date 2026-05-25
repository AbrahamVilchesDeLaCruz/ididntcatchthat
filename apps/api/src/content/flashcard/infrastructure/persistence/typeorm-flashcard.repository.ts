import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';
import { Flashcard } from '@/content/flashcard/domain/flashcard';
import { type FlashcardId } from '@/content/flashcard/domain/flashcard-id';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type Criteria } from '@/shared/domain/criteria';
import { InvalidCriteriaField } from '@/content/flashcard/domain/exceptions/invalid-criteria-field';
import { FlashcardEntity } from './flashcard.entity';

@Injectable()
export class TypeOrmFlashcardRepository implements FlashcardRepository {
  private readonly allowedFields: ReadonlySet<string> = new Set([
    'id',
    'expression',
    'meaning',
    'category',
    'subcategory',
    'ipaNotation',
    'nativeSpeech',
    'audioStatus',
    'createdBy',
  ]);

  private readonly allowedOperators: ReadonlySet<string> = new Set([
    '=',
    '!=',
    '<',
    '<=',
    '>',
    '>=',
    'LIKE',
    'ILIKE',
  ]);

  constructor(
    @InjectRepository(FlashcardEntity)
    private readonly repo: Repository<FlashcardEntity>,
  ) {}

  async match(criteria: Criteria): Promise<Flashcard[]> {
    const qb = this.repo.createQueryBuilder('f');
    this.applyFilters(qb, criteria);

    if (criteria.order) {
      if (!this.allowedFields.has(criteria.order.field)) {
        throw new InvalidCriteriaField();
      }
      qb.orderBy(`f.${criteria.order.field}`, criteria.order.direction);
    }

    if (criteria.limit !== null) qb.take(criteria.limit);
    if (criteria.offset !== null) qb.skip(criteria.offset);

    const entities = await qb.getMany();
    return entities.map((e) => this.toDomain(e));
  }

  async count(criteria: Criteria): Promise<number> {
    const qb = this.repo.createQueryBuilder('f');
    this.applyFilters(qb, criteria);
    return qb.getCount();
  }

  async search(id: FlashcardId): Promise<Flashcard | null> {
    const entity = await this.repo.findOneBy({ id: id.value });
    return entity ? this.toDomain(entity) : null;
  }

  async save(flashcard: Flashcard): Promise<void> {
    await this.repo.save(this.toEntity(flashcard));
  }

  async saveAll(flashcards: Flashcard[]): Promise<void> {
    await this.repo.save(flashcards.map((fc) => this.toEntity(fc)));
  }

  async remove(id: FlashcardId): Promise<void> {
    await this.repo.delete({ id: id.value });
  }

  private applyFilters(
    qb: SelectQueryBuilder<FlashcardEntity>,
    criteria: Criteria,
  ): void {
    for (const filter of criteria.filters) {
      if (!this.allowedFields.has(filter.field)) {
        throw new InvalidCriteriaField();
      }
      if (!this.allowedOperators.has(filter.operator)) {
        throw new InvalidCriteriaField();
      }
      const param = `p_${filter.field}`;
      qb.andWhere(`f.${filter.field} ${filter.operator} :${param}`, {
        [param]: filter.value,
      });
    }
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
