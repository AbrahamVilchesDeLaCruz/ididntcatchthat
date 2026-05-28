import { Inject, Injectable } from '@nestjs/common';
import {
  type Flashcard,
  type FlashcardPrimitives,
} from '@/content/flashcard/domain/flashcard';
import { FlashcardId } from '@/shared/domain/flashcard-id';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import { FlashcardAccessDenied } from '@/content/flashcard/domain/exceptions/flashcard-access-denied';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';

const ADMIN_ROLE = 'admin' as const;

type FlashcardUpdaterExampleDto = {
  id: string;
  textEn: string;
  textEs: string;
  position: number;
};

type FlashcardUpdaterFieldsDto = {
  expression?: string;
  meaning?: string;
  category?: string;
  subcategory?: string;
  ipaNotation?: string | null;
  nativeSpeech?: string | null;
  examples?: FlashcardUpdaterExampleDto[];
};

export type RequestFlashcardUpdater = {
  id: string;
  requesterId: string;
  requesterRole: string;
  fields: FlashcardUpdaterFieldsDto;
};

@Injectable()
export class FlashcardUpdater {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(
    request: RequestFlashcardUpdater,
  ): Promise<FlashcardPrimitives> {
    const flashcard = await this.findOrFail(request.id);

    this.ensureAccess(flashcard, request.requesterId, request.requesterRole);

    flashcard.update(request.fields);

    await this.repository.save(flashcard);
    await this.publisher.publish(flashcard.pullDomainEvents());

    return flashcard.toPrimitives();
  }

  private async findOrFail(id: string): Promise<Flashcard> {
    const flashcard = await this.repository.search(new FlashcardId(id));
    if (!flashcard) throw new FlashcardNotFound();
    return flashcard;
  }

  private ensureAccess(
    flashcard: Flashcard,
    requesterId: string,
    requesterRole: string,
  ): void {
    if (requesterRole === ADMIN_ROLE) return;
    if (flashcard.createdBy !== requesterId) throw new FlashcardAccessDenied();
  }
}
