import { Injectable } from '@nestjs/common';
import {
  type FlashcardDraftGeneratorPort,
  type GenerateFlashcardDraftsParams,
} from '@/content/flashcard/domain/flashcard-draft-generator';
import { type FlashcardDraft } from '@/content/flashcard/domain/flashcard-draft';

@Injectable()
export class StubFlashcardDraftGenerator implements FlashcardDraftGeneratorPort {
  generate(params: GenerateFlashcardDraftsParams): Promise<FlashcardDraft[]> {
    const anchor = params.anchorExamples[0] ?? 'example';
    return Promise.resolve(
      Array.from({ length: params.count }, (_, i) => ({
        expression: `${anchor} stub ${String(i + 1)}`,
        meaning: `Significado stub ${String(i + 1)}`,
        category: params.category,
        subcategory: params.subcategory,
        ipaNotation: null,
        nativeSpeech: null,
        examples: [
          {
            textEn: `This is a stub example for ${anchor}.`,
            textEs: `Este es un ejemplo stub para ${anchor}.`,
          },
        ],
      })),
    );
  }
}
