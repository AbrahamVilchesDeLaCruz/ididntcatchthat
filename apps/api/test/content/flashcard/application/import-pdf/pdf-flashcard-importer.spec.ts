import { mock } from 'jest-mock-extended';
import { PdfFlashcardImporter } from '@/content/flashcard/application/import-pdf/pdf-flashcard-importer';
import { type PdfFlashcardExtractor } from '@/content/flashcard/domain/pdf-flashcard-extractor';
import { type FlashcardDraft } from '@/content/flashcard/domain/pdf-flashcard-extractor';
import { PdfExtractionFailed } from '@/content/flashcard/domain/exceptions/pdf-extraction-failed';
import { CategoryValue } from '@/content/flashcard/domain/category';
import { MasteringSoundsSubcategory } from '@/content/flashcard/domain/subcategory-enums';
import { StringMother } from '@test/shared/domain/string-mother';
import { type Logger } from '@/shared/domain/logger';

const makeDraft = (): FlashcardDraft => ({
  expression: StringMother.sentence(),
  meaning: StringMother.sentence(),
  category: CategoryValue.MasteringSounds,
  subcategory: MasteringSoundsSubcategory.FLAP_T_PARTY_CITY,
  ipaNotation: null,
  nativeSpeech: null,
  examples: [],
});

describe('content/flashcard/application/import-pdf PdfFlashcardImporter', () => {
  const extractor = mock<PdfFlashcardExtractor>();
  const logger = mock<Logger>();
  let importer: PdfFlashcardImporter;

  beforeEach(() => {
    extractor.extract.mockReset();
    importer = new PdfFlashcardImporter(extractor, logger);
  });

  it('should return drafts extracted from the PDF without persisting', async () => {
    const drafts = [makeDraft(), makeDraft()];
    extractor.extract.mockResolvedValue(drafts);

    const result = await importer.execute(Buffer.from('pdf'));

    expect(extractor.extract).toHaveBeenCalledTimes(1);
    expect(result).toEqual(drafts);
  });

  it('should throw PdfExtractionFailed when extractor throws an Error', async () => {
    extractor.extract.mockRejectedValue(new Error('parse error'));

    await expect(importer.execute(Buffer.from('pdf'))).rejects.toThrow(
      PdfExtractionFailed,
    );
  });

  it('should throw PdfExtractionFailed when extractor throws a non-Error value', async () => {
    extractor.extract.mockRejectedValue('string error');

    await expect(importer.execute(Buffer.from('pdf'))).rejects.toThrow(
      PdfExtractionFailed,
    );
  });
});
