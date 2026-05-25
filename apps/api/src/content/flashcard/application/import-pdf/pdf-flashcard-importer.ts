import { Inject, Injectable } from '@nestjs/common';
import {
  type PdfFlashcardExtractor,
  type FlashcardDraft,
  PDF_FLASHCARD_EXTRACTOR,
} from '@/content/flashcard/domain/pdf-flashcard-extractor';
import { PdfExtractionFailed } from '@/content/flashcard/domain/exceptions/pdf-extraction-failed';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

@Injectable()
export class PdfFlashcardImporter {
  constructor(
    @Inject(PDF_FLASHCARD_EXTRACTOR)
    private readonly extractor: PdfFlashcardExtractor,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(pdfBuffer: Buffer): Promise<FlashcardDraft[]> {
    try {
      return await this.extractor.extract(pdfBuffer);
    } catch (error) {
      this.logger.error(
        'PDF extraction failed',
        error instanceof Error ? error : undefined,
      );
      throw new PdfExtractionFailed();
    }
  }
}
