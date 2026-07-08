import { mock } from 'jest-mock-extended';
import { FlashcardAudioBulkRegenerator } from '@/content/flashcard/application/regenerate-audio/flashcard-audio-bulk-regenerator';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { type Logger } from '@/shared/domain/logger';
import { AudioStatusValue } from '@/content/flashcard/domain/audio-status';
import { FlashcardAudioRegenerationRequestedEvent } from '@/content/flashcard/domain/events/flashcard-audio-regeneration-requested.event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';

describe('content/flashcard/application/regenerate-audio FlashcardAudioBulkRegenerator', () => {
  const repository = mock<FlashcardRepository>();
  const publisher = mock<DomainEventPublisher>();
  const generator = mock<FlashcardAudioGenerator>();
  const logger = mock<Logger>();
  let bulkRegenerator: FlashcardAudioBulkRegenerator;

  beforeEach(() => {
    repository.match.mockReset();
    repository.save.mockReset();
    publisher.publish.mockReset();
    generator.execute.mockReset();
    logger.info.mockReset();
    repository.save.mockResolvedValue(undefined);
    publisher.publish.mockResolvedValue(undefined);
    bulkRegenerator = new FlashcardAudioBulkRegenerator(
      repository,
      publisher,
      logger,
    );
  });

  it('should request regeneration for pending flashcards and publish events', async () => {
    const pending = FlashcardMother.random({
      audioStatus: AudioStatusValue.Pending,
    });
    const failed = FlashcardMother.random({
      audioStatus: AudioStatusValue.Failed,
    });
    const ready = FlashcardMother.random({
      audioStatus: AudioStatusValue.Ready,
    });
    repository.match.mockResolvedValue([pending, failed, ready]);

    const result = await bulkRegenerator.execute({
      audioStatus: 'pending',
      page: 1,
      pageSize: 20,
    });

    expect(result.triggered).toBe(2);
    expect(repository.save).toHaveBeenCalledTimes(2);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const publishedEvents = publisher.publish.mock.calls.flatMap(
      (call) => call[0],
    );
    expect(
      publishedEvents.every(
        (event) => event instanceof FlashcardAudioRegenerationRequestedEvent,
      ),
    ).toBe(true);
    expect(generator.execute).not.toHaveBeenCalled();
  });

  it('should apply category and subcategory filters via criteria', async () => {
    repository.match.mockResolvedValue([]);

    await bulkRegenerator.execute({
      audioStatus: 'failed',
      category: 'connected_speech',
      subcategory: 'informal_going_to',
      page: 2,
      pageSize: 10,
    });

    expect(repository.match).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 10,
        offset: 10,
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

  it('should return zero and not save when no flashcards match', async () => {
    repository.match.mockResolvedValue([]);

    const result = await bulkRegenerator.execute({
      audioStatus: 'failed',
      page: 1,
      pageSize: 20,
    });

    expect(result.triggered).toBe(0);
    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should skip flashcards that are already ready', async () => {
    const ready = FlashcardMother.random({
      audioStatus: AudioStatusValue.Ready,
    });
    repository.match.mockResolvedValue([ready]);

    const result = await bulkRegenerator.execute({
      audioStatus: 'ready',
      page: 1,
      pageSize: 20,
    });

    expect(result.triggered).toBe(0);
    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
