import { Inject, Injectable } from '@nestjs/common';
import { FlashcardId } from '@/content/flashcard/domain/flashcard-id';
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

export type AiPhoneticsCompleterRequest = {
  flashcardId: string;
};

@Injectable()
export class AiPhoneticsCompleter {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(AI_PHONETICS_GENERATOR)
    private readonly aiPhoneticsGenerator: AiPhoneticsGenerator,
  ) {}

  async execute(request: AiPhoneticsCompleterRequest): Promise<void> {
    const flashcard = await this.repository.search(
      new FlashcardId(request.flashcardId),
    );
    if (!flashcard) return;

    const { ipaNotation, nativeSpeech } =
      await this.aiPhoneticsGenerator.generate(flashcard.expression.value);

    flashcard.completePhonetics(ipaNotation, nativeSpeech);

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());
  }
}
