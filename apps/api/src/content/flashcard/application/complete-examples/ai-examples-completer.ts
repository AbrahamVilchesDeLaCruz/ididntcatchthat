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
  type AiExampleGenerator,
  AI_EXAMPLE_GENERATOR,
} from '@/content/flashcard/domain/ai-example-generator';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { UuidValueObject } from '@/shared/domain/uuid-value-object';
import { type RequestAiExamplesCompleter } from './request-ai-examples-completer';

export type { RequestAiExamplesCompleter } from './request-ai-examples-completer';

@Injectable()
export class AiExamplesCompleter {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(AI_EXAMPLE_GENERATOR)
    private readonly generator: AiExampleGenerator,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(request: RequestAiExamplesCompleter): Promise<void> {
    const { flashcardId } = request;

    const flashcard = await this.repository.search(
      new FlashcardId(flashcardId),
    );
    if (!flashcard) return;

    const missing = flashcard.missingExampleCount;
    const newExamples =
      missing > 0
        ? (
            await this.generator.generate(
              flashcard.expression.value,
              flashcard.category.value,
            )
          )
            .slice(0, missing)
            .map((e, i) => ({
              id: UuidValueObject.random(),
              textEn: e.textEn,
              textEs: e.textEs,
              position: (flashcard.nextExamplePosition + i) as 1 | 2 | 3,
            }))
        : [];

    flashcard.completeExamples(newExamples);

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());

    this.logger.info('Flashcard examples completed', {
      flashcardId,
      addedCount: newExamples.length,
    });
  }
}
