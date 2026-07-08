import { mock } from 'jest-mock-extended';
import { type Logger } from '@/shared/domain/logger';
import { FlashcardAudioRegenerator } from '@/content/flashcard/application/regenerate-audio/flashcard-audio-regenerator';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { AudioStatusValue } from '@/content/flashcard/domain/audio-status';
import { AudioStatusInvalid } from '@/content/flashcard/domain/exceptions/audio-status-invalid';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import { FlashcardAudioRegenerationRequestedEvent } from '@/content/flashcard/domain/events/flashcard-audio-regeneration-requested.event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { RequestFlashcardAudioRegeneratorMother } from './request-flashcard-audio-regenerator-mother';

describe('content/flashcard/application/regenerate-audio FlashcardAudioRegenerator', () => {
  const repository = mock<FlashcardRepository>();
  const publisher = mock<DomainEventPublisher>();
  const generator = mock<FlashcardAudioGenerator>();
  const logger = mock<Logger>();
  let regenerator: FlashcardAudioRegenerator;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    publisher.publish.mockReset();
    generator.execute.mockReset();
    repository.search.mockResolvedValue(null);
    repository.save.mockResolvedValue(undefined);
    publisher.publish.mockResolvedValue(undefined);
    regenerator = new FlashcardAudioRegenerator(
      repository,
      publisher,
      generator,
      logger,
    );
  });

  it('should request audio regeneration when flashcard status is failed', async () => {
    const flashcard = FlashcardMother.random({
      audioStatus: AudioStatusValue.Failed,
    });
    repository.search.mockResolvedValue(flashcard);

    await regenerator.execute(
      RequestFlashcardAudioRegeneratorMother.random({
        flashcardId: flashcard.id.value,
      }),
    );

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(flashcard.audioStatus.value).toBe(AudioStatusValue.Generating);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(FlashcardAudioRegenerationRequestedEvent);
    expect(generator.execute).not.toHaveBeenCalled();
  });

  it('should request audio regeneration when flashcard status is pending', async () => {
    const flashcard = FlashcardMother.random({
      audioStatus: AudioStatusValue.Pending,
    });
    repository.search.mockResolvedValue(flashcard);

    await regenerator.execute(
      RequestFlashcardAudioRegeneratorMother.random({
        flashcardId: flashcard.id.value,
      }),
    );

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(flashcard.audioStatus.value).toBe(AudioStatusValue.Generating);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(generator.execute).not.toHaveBeenCalled();
  });

  it('should request audio regeneration when flashcard status is generating', async () => {
    const flashcard = FlashcardMother.random({
      audioStatus: AudioStatusValue.Generating,
    });
    repository.search.mockResolvedValue(flashcard);

    await regenerator.execute(
      RequestFlashcardAudioRegeneratorMother.random({
        flashcardId: flashcard.id.value,
      }),
    );

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(flashcard.audioStatus.value).toBe(AudioStatusValue.Generating);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    expect(generator.execute).not.toHaveBeenCalled();
  });

  it('should throw FlashcardNotFound when flashcard does not exist', async () => {
    await expect(
      regenerator.execute(RequestFlashcardAudioRegeneratorMother.random()),
    ).rejects.toThrow(FlashcardNotFound);
    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(generator.execute).not.toHaveBeenCalled();
  });

  it('should throw AudioStatusInvalid when flashcard is ready', async () => {
    const flashcard = FlashcardMother.random({
      audioStatus: AudioStatusValue.Ready,
    });
    repository.search.mockResolvedValue(flashcard);

    await expect(
      regenerator.execute(
        RequestFlashcardAudioRegeneratorMother.random({
          flashcardId: flashcard.id.value,
        }),
      ),
    ).rejects.toThrow(AudioStatusInvalid);
    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
    expect(generator.execute).not.toHaveBeenCalled();
  });

  it('should publish after saving the aggregate', async () => {
    const flashcard = FlashcardMother.random({
      audioStatus: AudioStatusValue.Failed,
    });
    repository.search.mockResolvedValue(flashcard);

    const callOrder: string[] = [];
    repository.save.mockImplementation(() => {
      callOrder.push('save');
      return Promise.resolve();
    });
    publisher.publish.mockImplementation(() => {
      callOrder.push('publish');
      return Promise.resolve();
    });

    await regenerator.execute(
      RequestFlashcardAudioRegeneratorMother.random({
        flashcardId: flashcard.id.value,
      }),
    );

    expect(callOrder).toEqual(['save', 'publish']);
  });
});
