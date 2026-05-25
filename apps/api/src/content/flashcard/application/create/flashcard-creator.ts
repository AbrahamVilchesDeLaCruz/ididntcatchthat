import { Inject, Injectable } from '@nestjs/common';
import {
  Flashcard,
  type FlashcardPrimitives,
} from '@/content/flashcard/domain/flashcard';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';

type ExampleInputDto = {
  id: string;
  textEn: string;
  textEs: string;
  position: number;
};

export type RequestFlashcardCreator = {
  id: string;
  expression: string;
  meaning: string;
  category: string;
  subcategory: string;
  ipaNotation: string | null;
  nativeSpeech: string | null;
  examples: ExampleInputDto[];
  createdBy: string;
};

@Injectable()
export class FlashcardCreator {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(
    request: RequestFlashcardCreator,
  ): Promise<FlashcardPrimitives> {
    const flashcard = Flashcard.create(
      request.id,
      request.expression,
      request.meaning,
      request.category,
      request.subcategory,
      request.ipaNotation,
      request.nativeSpeech,
      request.examples.map((e) => ({ ...e, flashcardId: request.id })),
      request.createdBy,
    );

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());

    return flashcard.toPrimitives();
  }
}
