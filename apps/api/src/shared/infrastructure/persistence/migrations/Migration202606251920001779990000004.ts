import { type MigrationInterface, type QueryRunner } from 'typeorm';
import {
  LEGACY_CATEGORY_MAP,
  LEGACY_SUBCATEGORY_MAP,
} from '@/content/flashcard/infrastructure/persistence/legacy-taxonomy-map';

/**
 * Migration: remap legacy content taxonomy (ADR-024) in flashcards table.
 *
 * Converts pre-refactor category/subcategory slugs (e.g. connecting_words_in_speech,
 * WANNA_AND_GONNA) to the unified LearningModule vocabulary.
 */
export class Migration202606251920001779990000004 implements MigrationInterface {
  name = 'Migration202606251920001779990000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [legacyCategory, module] of Object.entries(
      LEGACY_CATEGORY_MAP,
    )) {
      await queryRunner.query(
        `UPDATE flashcards SET category = $1 WHERE category = $2`,
        [module, legacyCategory],
      );
    }

    for (const [legacySubcategory, subcategory] of Object.entries(
      LEGACY_SUBCATEGORY_MAP,
    )) {
      await queryRunner.query(
        `UPDATE flashcards SET subcategory = $1 WHERE subcategory = $2`,
        [subcategory, legacySubcategory],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [legacySubcategory, subcategory] of Object.entries(
      LEGACY_SUBCATEGORY_MAP,
    )) {
      await queryRunner.query(
        `UPDATE flashcards SET subcategory = $1 WHERE subcategory = $2`,
        [legacySubcategory, subcategory],
      );
    }

    for (const [legacyCategory, module] of Object.entries(
      LEGACY_CATEGORY_MAP,
    )) {
      await queryRunner.query(
        `UPDATE flashcards SET category = $1 WHERE category = $2`,
        [legacyCategory, module],
      );
    }
  }
}
