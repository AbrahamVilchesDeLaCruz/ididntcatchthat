import { Inject, Injectable } from '@nestjs/common';
import { Category } from '@/content/flashcard/domain/category';
import { Subcategory } from '@/content/flashcard/domain/subcategory';
import {
  FLASHCARD_DRAFT_GENERATOR,
  type FlashcardDraftGeneratorPort,
} from '@/content/flashcard/domain/flashcard-draft-generator';
import {
  FLASHCARD_REPOSITORY,
  type FlashcardRepository,
} from '@/content/flashcard/domain/flashcard.repository';
import { getSubcategoryMeta } from '@/content/flashcard/domain/subcategory-catalog';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import {
  type RequestAiFlashcardDraftGenerator,
  type ResponseAiFlashcardDraftGenerator,
} from './request-ai-flashcard-draft-generator';

const DEFAULT_COUNT = 10;
const MAX_COUNT = 20;

@Injectable()
export class AiFlashcardDraftGenerator {
  constructor(
    @Inject(FLASHCARD_DRAFT_GENERATOR)
    private readonly draftGenerator: FlashcardDraftGeneratorPort,
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
  ) {}

  async execute(
    request: RequestAiFlashcardDraftGenerator,
  ): Promise<ResponseAiFlashcardDraftGenerator> {
    const { category, subcategory, prompt } = request;
    const count = Math.min(
      Math.max(request.count ?? DEFAULT_COUNT, 1),
      MAX_COUNT,
    );

    new Category(category);
    new Subcategory(subcategory, new Category(category));

    const meta = getSubcategoryMeta(subcategory);
    const anchorExamples = meta?.anchorExamples ?? [];

    const existing = await this.repository.match(
      new Criteria([
        { field: 'category', operator: FilterOperator.EQ, value: category },
        {
          field: 'subcategory',
          operator: FilterOperator.EQ,
          value: subcategory,
        },
      ]),
    );

    const existingExpressions = existing.map((fc) => fc.expression.value);

    const drafts = await this.draftGenerator.generate({
      category,
      subcategory,
      count,
      existingExpressions,
      anchorExamples,
      customPrompt: prompt,
    });

    return {
      drafts: drafts.map((draft) => ({
        expression: draft.expression,
        meaning: draft.meaning,
        category: draft.category,
        subcategory: draft.subcategory,
        ipaNotation: draft.ipaNotation,
        nativeSpeech: draft.nativeSpeech,
        examples: draft.examples,
      })),
    };
  }
}
