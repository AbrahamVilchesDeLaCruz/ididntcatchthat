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
  type AiPhoneticsGenerator,
  AI_PHONETICS_GENERATOR,
} from '@/content/flashcard/domain/ai-phonetics-generator';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestAiPhoneticsCompleter } from './request-ai-phonetics-completer';

export type { RequestAiPhoneticsCompleter } from './request-ai-phonetics-completer';

@Injectable()
export class AiPhoneticsCompleter {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(AI_PHONETICS_GENERATOR)
    private readonly aiPhoneticsGenerator: AiPhoneticsGenerator,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestAiPhoneticsCompleter): Promise<void> {
    const { flashcardId } = request;

    const flashcard = await this.repository.search(
      new FlashcardId(flashcardId),
    );
    if (!flashcard) return;

    const { ipaNotation, nativeSpeech } =
      await this.aiPhoneticsGenerator.generate(flashcard.expression.value);

    flashcard.completePhonetics(ipaNotation, nativeSpeech);

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());

    this.logger.info('Flashcard phonetics completed', { flashcardId });
  }
}
