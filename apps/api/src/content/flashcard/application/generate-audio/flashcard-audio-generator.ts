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
import { type AppMetrics, APP_METRICS } from '@/shared/domain/app-metrics';
import { AudioUrls } from '@/content/flashcard/domain/audio-urls';
import { AudioGenerationFailed } from '@/content/flashcard/domain/exceptions/audio-generation-failed';
import { type Flashcard } from '@/content/flashcard/domain/flashcard';
import { type RequestFlashcardAudioGenerator } from './request-flashcard-audio-generator';

export type { RequestFlashcardAudioGenerator } from './request-flashcard-audio-generator';

export function resolveExpressionAudioText(flashcard: Flashcard): string {
  const expression = flashcard.expression.value;
  const nativeSpeech = flashcard.nativeSpeech?.value ?? null;

  const preferNativeSpeech =
    nativeSpeech !== null &&
    !nativeSpeech.includes('.') &&
    nativeSpeech.length <= expression.length + 20 &&
    nativeSpeech.length < expression.length;

  const base = preferNativeSpeech ? nativeSpeech : expression;
  return `"${base}"`;
}

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
    @Inject(APP_METRICS)
    private readonly metrics: AppMetrics,
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
      const expressionText = resolveExpressionAudioText(flashcard);
      const accents: AudioAccent[] = ['us', 'uk', 'au'];
      const expressionBuffers: Buffer[] = [];
      for (const accent of accents) {
        expressionBuffers.push(
          await this.audioGenerator.generate(
            expressionText,
            accent,
            'expression',
          ),
        );
      }

      const examplesBuffer = await this.audioGenerator.generate(
        flashcard.examplesEnglishText,
        'us',
        'examples',
      );

      const id = flashcard.id.value;
      const [usUrl, ukUrl, auUrl, examplesUsUrl] = await Promise.all([
        this.audioStorage.upload(
          `audio/${id}/expression-us.mp3`,
          expressionBuffers[0],
          'audio/mpeg',
        ),
        this.audioStorage.upload(
          `audio/${id}/expression-uk.mp3`,
          expressionBuffers[1],
          'audio/mpeg',
        ),
        this.audioStorage.upload(
          `audio/${id}/expression-au.mp3`,
          expressionBuffers[2],
          'audio/mpeg',
        ),
        this.audioStorage.upload(
          `audio/${id}/examples-us.mp3`,
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
      this.metrics.increment('app_audio_generated_total', {
        provider: 'elevenlabs',
      });
    } catch (e: unknown) {
      const errorContext: Record<string, unknown> = { flashcardId };
      if (e instanceof AudioGenerationFailed) {
        errorContext.elevenLabsStatus = e.status;
        if (e.detail !== null) {
          errorContext.elevenLabsDetail = e.detail;
        }
      }
      this.logger.error(
        'FlashcardAudioGenerator failed',
        e instanceof Error ? e : new Error(String(e)),
        errorContext,
      );
      flashcard.markAudioFailed();
      this.metrics.increment('app_audio_errors_total', {
        provider: 'elevenlabs',
      });
    }

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());
  }
}
