import { Injectable } from '@nestjs/common';
import {
  type PdfFlashcardExtractor,
  type FlashcardDraft,
} from '@/content/flashcard/domain/pdf-flashcard-extractor';

@Injectable()
export class StubPdfFlashcardExtractor implements PdfFlashcardExtractor {
  extract(_pdfBuffer: Buffer): Promise<FlashcardDraft[]> {
    return Promise.resolve([]);
  }
}
