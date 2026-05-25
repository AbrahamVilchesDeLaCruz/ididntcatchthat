import { Inject, Injectable } from '@nestjs/common';
import {
  Flashcard,
  type FlashcardPrimitives,
} from '@/content/flashcard/domain/flashcard';
import { BulkEmptyFlashcards } from '@/content/flashcard/domain/exceptions/bulk-empty-flashcards';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';

type FlashcardBulkItem = {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation?: string | null;
  nativeSpeech?: string | null;
  examples: { id: string; textEn: string; textEs: string; position: number }[];
  createdBy: string;
};

export type FlashcardBulkCreatorResult = {
  created: number;
  flashcards: FlashcardPrimitives[];
};

@Injectable()
export class FlashcardBulkCreator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(
    requests: FlashcardBulkItem[],
  ): Promise<FlashcardBulkCreatorResult> {
    if (requests.length === 0) throw new BulkEmptyFlashcards();

    // Build all aggregates first — any domain error aborts the whole batch
    const flashcards = requests.map((req) =>
      Flashcard.create(
        req.id,
        req.expression,
        req.meaning,
        req.category,
        req.subcategory,
        req.ipaNotation,
        req.nativeSpeech,
        req.examples,
        req.createdBy,
      ),
    );

    // Persist all
    await this.repository.saveAll(flashcards);

    // Collect and publish all events in a single call
    const allEvents = flashcards.flatMap((fc) => fc.pullDomainEvents());
    await this.publisher.publish(allEvents);

    return {
      created: flashcards.length,
      flashcards: flashcards.map((fc) => fc.toPrimitives()),
    };
  }
}
