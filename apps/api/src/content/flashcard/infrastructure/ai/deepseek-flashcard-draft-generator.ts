import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  type FlashcardDraftGeneratorPort,
  type GenerateFlashcardDraftsParams,
} from '@/content/flashcard/domain/flashcard-draft-generator';
import { type FlashcardDraft } from '@/content/flashcard/domain/flashcard-draft';
import { getSubcategoryMeta } from '@/content/flashcard/domain/subcategory-catalog';
import {
  LEARNING_MODULE_LABELS,
  LearningModule,
} from '@/shared/domain/learning-module';

@Injectable()
export class DeepSeekFlashcardDraftGenerator implements FlashcardDraftGeneratorPort {
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.getOrThrow<string>('DEEPSEEK_API_KEY'),
      baseURL: 'https://api.deepseek.com',
    });
  }

  async generate(
    params: GenerateFlashcardDraftsParams,
  ): Promise<FlashcardDraft[]> {
    const meta = getSubcategoryMeta(params.subcategory);
    const categoryLabel =
      LEARNING_MODULE_LABELS[params.category as LearningModule]?.en ??
      params.category;
    const subcategoryLabel = meta?.label.en ?? params.subcategory;

    const existingList =
      params.existingExpressions.length > 0
        ? params.existingExpressions.join(', ')
        : 'none';

    const anchorList = params.anchorExamples.join(', ');

    const userPrompt = [
      `Generate exactly ${String(params.count)} original English flashcards.`,
      `Category: ${categoryLabel} (${params.category})`,
      `Subcategory: ${subcategoryLabel} (${params.subcategory})`,
      `Anchor example words for this subcategory (use as style guide, do NOT copy verbatim): ${anchorList}`,
      `Existing expressions to avoid duplicating: ${existingList}`,
      params.customPrompt
        ? `Additional instructions: ${params.customPrompt}`
        : '',
      'Each flashcard must have 1-3 example sentences with Spanish translations.',
      'Content must be original — do not copy from textbooks or courses.',
    ]
      .filter(Boolean)
      .join('\n');

    const completion = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an English phonetics and connected speech expert creating flashcards for Spanish-speaking learners.
Return ONLY a JSON array with this exact structure, no markdown, no explanation:
[{
  "expression": "the expression or word",
  "meaning": "short Spanish meaning",
  "category": "${params.category}",
  "subcategory": "${params.subcategory}",
  "ipaNotation": "/ɪpə nəʊˈteɪʃən/ or null",
  "nativeSpeech": "how it sounds in natural speech or null",
  "examples": [
    {"textEn": "example sentence", "textEs": "traducción"}
  ]
}]
Rules:
- category and subcategory MUST match the request exactly
- expressions must be original and not duplicate the existing list
- focus on the subcategory sound or pattern described`,
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '[]';
    return JSON.parse(raw) as FlashcardDraft[];
  }
}
