import { Inject, Injectable } from '@nestjs/common';
import {
  type PdfFlashcardExtractor,
  type FlashcardDraft,
  PDF_FLASHCARD_EXTRACTOR,
} from '@/content/flashcard/domain/pdf-flashcard-extractor';
import { PdfExtractionFailed } from '@/content/flashcard/domain/exceptions/pdf-extraction-failed';

@Injectable()
export class PdfFlashcardImporter {
  constructor(
    @Inject(PDF_FLASHCARD_EXTRACTOR)
    private readonly extractor: PdfFlashcardExtractor,
  ) {}

  async execute(pdfBuffer: Buffer): Promise<FlashcardDraft[]> {
    try {
      return await this.extractor.extract(pdfBuffer);
    } catch {
      throw new PdfExtractionFailed();
    }
  }
}
