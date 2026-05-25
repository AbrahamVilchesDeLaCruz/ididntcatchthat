import { mock } from 'jest-mock-extended';
import { type FlashcardRepository } from '@/content/flashcard/domain/flashcard.repository';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type AudioGenerator } from '@/content/flashcard/domain/audio-generator';
import { type AudioStorage } from '@/content/flashcard/domain/audio-storage';
import { type Logger } from '@/shared/domain/logger';
import { FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { FlashcardAudioReadyEvent } from '@/content/flashcard/domain/events/flashcard-audio-ready.event';
import { FlashcardAudioFailedEvent } from '@/content/flashcard/domain/events/flashcard-audio-failed.event';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { FlashcardMother } from '@test/content/flashcard/domain/flashcard-mother';
import { FlashcardIdMother } from '@test/content/flashcard/domain/flashcard-id-mother';
import { ExampleMother } from '@test/content/flashcard/domain/example-mother';

describe('content/flashcard/application/generate-audio FlashcardAudioGenerator', () => {
  const repository = mock<FlashcardRepository>();
  const publisher = mock<DomainEventPublisher>();
  const audioGenerator = mock<AudioGenerator>();
  const audioStorage = mock<AudioStorage>();
  const logger = mock<Logger>();
  let generator: FlashcardAudioGenerator;

  const fakeBuffer = Buffer.from('audio');
  const fakeUrl = (name: string): string =>
    `https://pub-xxx.r2.dev/idct/audio/fake-id/${name}.mp3`;

  beforeEach(() => {
    repository.search.mockReset();
    repository.save.mockReset();
    publisher.publish.mockReset();
    audioGenerator.generate.mockReset();
    audioStorage.upload.mockReset();

    publisher.publish.mockResolvedValue(undefined);
    repository.save.mockResolvedValue(undefined);
    audioGenerator.generate.mockResolvedValue(fakeBuffer);
    audioStorage.upload.mockImplementation((key) =>
      Promise.resolve(fakeUrl(key)),
    );

    generator = new FlashcardAudioGenerator(
      repository,
      publisher,
      audioGenerator,
      audioStorage,
      logger,
    );
  });

  it('should generate audio for all accents and publish FlashcardAudioReadyEvent', async () => {
    const flashcardId = FlashcardIdMother.random().value;
    const flashcard = FlashcardMother.random({
      examples: [ExampleMother.primitives(flashcardId, 1)],
    });
    repository.search.mockResolvedValue(flashcard);

    await generator.execute({ flashcardId: flashcard.id.value });

    // 3 accents for expression + 1 for examples = 4 calls
    expect(audioGenerator.generate).toHaveBeenCalledTimes(4);
    expect(audioStorage.upload).toHaveBeenCalledTimes(4);
    expect(repository.save).toHaveBeenCalledTimes(2); // markGenerating + markReady

    const events: DomainEvent[] = publisher.publish.mock.calls[1][0];
    expect(events[0]).toBeInstanceOf(FlashcardAudioReadyEvent);
  });

  it('should mark audio as failed and publish FlashcardAudioFailedEvent when generator throws', async () => {
    const flashcard = FlashcardMother.random({ examples: [] });
    repository.search.mockResolvedValue(flashcard);
    audioGenerator.generate.mockRejectedValue(
      new Error('ElevenLabs error: 429'),
    );

    await generator.execute({ flashcardId: flashcard.id.value });

    expect(repository.save).toHaveBeenCalledTimes(2); // markGenerating + markFailed
    const events: DomainEvent[] = publisher.publish.mock.calls[1][0];
    expect(events[0]).toBeInstanceOf(FlashcardAudioFailedEvent);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should mark audio as failed when generator throws a non-Error value', async () => {
    const flashcard = FlashcardMother.random({ examples: [] });
    repository.search.mockResolvedValue(flashcard);
    audioGenerator.generate.mockRejectedValue('string error');

    await generator.execute({ flashcardId: flashcard.id.value });

    expect(repository.save).toHaveBeenCalledTimes(2);
    const events: DomainEvent[] = publisher.publish.mock.calls[1][0];
    expect(events[0]).toBeInstanceOf(FlashcardAudioFailedEvent);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should do nothing when flashcard does not exist', async () => {
    repository.search.mockResolvedValue(null);

    await generator.execute({ flashcardId: FlashcardIdMother.random().value });

    expect(audioGenerator.generate).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
