import { Inject, Injectable } from '@nestjs/common';
import { FlashcardId } from '@/shared/domain/flashcard-id';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import {
  type AudioGenerator,
  AUDIO_GENERATOR,
  type AudioAccent,
} from '@/content/flashcard/domain/audio-generator';
import {
  type AudioStorage,
  AUDIO_STORAGE,
} from '@/content/flashcard/domain/audio-storage';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { AudioUrls } from '@/content/flashcard/domain/audio-urls';
import { type RequestFlashcardAudioGenerator } from './request-flashcard-audio-generator';

export type { RequestFlashcardAudioGenerator } from './request-flashcard-audio-generator';

@Injectable()
export class FlashcardAudioGenerator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(AUDIO_GENERATOR)
    private readonly audioGenerator: AudioGenerator,
    @Inject(AUDIO_STORAGE)
    private readonly audioStorage: AudioStorage,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestFlashcardAudioGenerator): Promise<void> {
    const { flashcardId } = request;

    const flashcard = await this.repository.search(
      new FlashcardId(flashcardId),
    );
    if (!flashcard) return;

    flashcard.markAudioGenerating();
    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());

    try {
      const accents: AudioAccent[] = ['us', 'uk', 'au'];
      const expressionBuffers: Buffer[] = [];
      for (const accent of accents) {
        expressionBuffers.push(
          await this.audioGenerator.generate(
            flashcard.expression.value,
            accent,
          ),
        );
      }

      const examplesText = flashcard.examples.map((e) => e.textEn).join('. ');
      const examplesBuffer = await this.audioGenerator.generate(
        examplesText,
        'us',
      );

      const flashcardId = flashcard.id.value;
      const [usUrl, ukUrl, auUrl, examplesUsUrl] = await Promise.all([
        this.audioStorage.upload(
          `audio/${flashcardId}/expression-us.mp3`,
          expressionBuffers[0],
          'audio/mpeg',
        ),
        this.audioStorage.upload(
          `audio/${flashcardId}/expression-uk.mp3`,
          expressionBuffers[1],
          'audio/mpeg',
        ),
        this.audioStorage.upload(
          `audio/${flashcardId}/expression-au.mp3`,
          expressionBuffers[2],
          'audio/mpeg',
        ),
        this.audioStorage.upload(
          `audio/${flashcardId}/examples-us.mp3`,
          examplesBuffer,
          'audio/mpeg',
        ),
      ]);

      flashcard.markAudioReady(
        new AudioUrls({
          expression: { us: usUrl, uk: ukUrl, au: auUrl },
          examples: { us: examplesUsUrl },
        }),
      );
    } catch (e: unknown) {
      this.logger.error(
        'FlashcardAudioGenerator failed',
        e instanceof Error ? e : new Error(String(e)),
        { flashcardId },
      );
      flashcard.markAudioFailed();
    }

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());
  }
}
