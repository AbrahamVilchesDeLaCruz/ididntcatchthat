import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, type SelectQueryBuilder } from 'typeorm';
import { Flashcard } from '@/content/flashcard/domain/flashcard';
import { type FlashcardId } from '@/shared/domain/flashcard-id';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type Criteria, FilterOperator } from '@/shared/domain/criteria';
import { InvalidCriteriaField } from '@/content/flashcard/domain/exceptions/invalid-criteria-field';
import { FlashcardEntity } from './flashcard.entity';
import { normalizeStoredExamples } from './normalize-stored-examples';
import { resolveLegacyTaxonomy } from './legacy-taxonomy-map';

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

  private readonly allowedOperators: ReadonlySet<FilterOperator> = new Set([
    FilterOperator.EQ,
    FilterOperator.NEQ,
    FilterOperator.LT,
    FilterOperator.LTE,
    FilterOperator.GT,
    FilterOperator.GTE,
    FilterOperator.LIKE,
    FilterOperator.ILIKE,
  ]);

  constructor(
    @InjectRepository(FlashcardEntity)
    private readonly repo: Repository<FlashcardEntity>,
  ) {}

  async match(criteria: Criteria): Promise<Flashcard[]> {
    const qb = this.repo.createQueryBuilder('f');
    qb.andWhere('f.deleted_at IS NULL');
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
    qb.andWhere('f.deleted_at IS NULL');
    this.applyFilters(qb, criteria);
    return qb.getCount();
  }

  async search(id: FlashcardId): Promise<Flashcard | null> {
    const entity = await this.repo.findOneBy({
      id: id.value,
      deletedAt: IsNull(),
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(flashcard: Flashcard): Promise<void> {
    await this.repo.save(this.toEntity(flashcard));
  }

  async saveAll(flashcards: Flashcard[]): Promise<void> {
    await this.repo.save(flashcards.map((fc) => this.toEntity(fc)));
  }

  async remove(id: FlashcardId): Promise<void> {
    await this.repo.update({ id: id.value }, { deletedAt: new Date() });
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
    const { category, subcategory } = resolveLegacyTaxonomy(
      entity.category,
      entity.subcategory,
    );

    return Flashcard.fromPrimitives({
      id: entity.id,
      expression: entity.expression,
      meaning: entity.meaning,
      category,
      subcategory,
      ipaNotation: entity.ipaNotation,
      nativeSpeech: entity.nativeSpeech,
      audioStatus: entity.audioStatus,
      audioUrls: entity.audioUrls,
      examples: normalizeStoredExamples(entity.id, entity.examples),
      createdBy: entity.createdBy,
      deletedAt: entity.deletedAt?.toISOString() ?? null,
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
    entity.deletedAt = p.deletedAt !== null ? new Date(p.deletedAt) : null;
    return entity;
  }
}
