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
  type AiExampleGenerator,
  AI_EXAMPLE_GENERATOR,
} from '@/content/flashcard/domain/ai-example-generator';
import { UuidValueObject } from '@/shared/domain/uuid-value-object';

const MAX_EXAMPLES = 3;

export type AiExamplesCompleterRequest = {
  flashcardId: string;
};

@Injectable()
export class AiExamplesCompleter {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(AI_EXAMPLE_GENERATOR)
    private readonly aiExampleGenerator: AiExampleGenerator,
  ) {}

  async execute(request: AiExamplesCompleterRequest): Promise<void> {
    const flashcard = await this.repository.search(
      new FlashcardId(request.flashcardId),
    );
    if (!flashcard) return;

    const missing = MAX_EXAMPLES - flashcard.examples.length;
    const newExamples =
      missing > 0
        ? (
            await this.aiExampleGenerator.generate(
              flashcard.expression.value,
              flashcard.category.value,
            )
          )
            .slice(0, missing)
            .map((e, i) => ({
              id: UuidValueObject.random(),
              textEn: e.textEn,
              textEs: e.textEs,
              position: (flashcard.examples.length + i + 1) as 1 | 2 | 3,
            }))
        : [];

    flashcard.completeExamples(newExamples);

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());
  }
}
