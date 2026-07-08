import { mock } from 'jest-mock-extended';
import { FlashcardAudioBulkRegenerator } from '@/content/flashcard/application/regenerate-audio/flashcard-audio-bulk-regenerator';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { type Logger } from '@/shared/domain/logger';
import { AudioStatusValue } from '@/content/flashcard/domain/audio-status';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';

describe('content/flashcard/application/regenerate-audio FlashcardAudioBulkRegenerator', () => {
  const repository = mock<FlashcardRepository>();
  const generator = mock<FlashcardAudioGenerator>();
  const logger = mock<Logger>();
  let bulkRegenerator: FlashcardAudioBulkRegenerator;

  beforeEach(() => {
    repository.match.mockReset();
    generator.execute.mockReset();
    logger.info.mockReset();
    generator.execute.mockResolvedValue(undefined);
    bulkRegenerator = new FlashcardAudioBulkRegenerator(
      repository,
      generator,
      logger,
    );
  });

  it('should trigger audio generation for all matching pending flashcards', async () => {
    const pending = FlashcardMother.random({
      audioStatus: AudioStatusValue.Pending,
    });
    const ready = FlashcardMother.random({
      audioStatus: AudioStatusValue.Ready,
    });
    repository.match.mockResolvedValue([pending, ready]);

    const result = await bulkRegenerator.execute({
      audioStatus: 'pending',
    });

    expect(result.triggered).toBe(1);
    expect(generator.execute).toHaveBeenCalledTimes(1);
    expect(generator.execute).toHaveBeenCalledWith({
      flashcardId: pending.id.value,
    });
  });

  it('should apply category and subcategory filters via criteria', async () => {
    repository.match.mockResolvedValue([]);

    await bulkRegenerator.execute({
      audioStatus: 'failed',
      category: 'connected_speech',
      subcategory: 'informal_going_to',
    });

    expect(repository.match).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.arrayContaining([
          expect.objectContaining({
            field: 'audioStatus',
            value: 'failed',
          }),
          expect.objectContaining({
            field: 'category',
            value: 'connected_speech',
          }),
          expect.objectContaining({
            field: 'subcategory',
            value: 'informal_going_to',
          }),
        ]),
      }),
    );
  });

  it('should return zero when no flashcards match', async () => {
    repository.match.mockResolvedValue([]);

    const result = await bulkRegenerator.execute({ audioStatus: 'failed' });

    expect(result.triggered).toBe(0);
    expect(generator.execute).not.toHaveBeenCalled();
  });
});
