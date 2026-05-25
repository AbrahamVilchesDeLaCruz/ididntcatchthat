import { Inject, Injectable } from '@nestjs/common';
import { type FlashcardPrimitives } from '@/content/flashcard/domain/flashcard';
import { FlashcardId } from '@/content/flashcard/domain/flashcard-id';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import {
  type FlashcardRepository,
  FLASHCARD_REPOSITORY,
} from '@/content/flashcard/domain/flashcard.repository';

@Injectable()
export class FlashcardFinder {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly repository: FlashcardRepository,
  ) {}

  async execute(id: string): Promise<FlashcardPrimitives> {
    const flashcard = await this.repository.search(new FlashcardId(id));
    if (!flashcard) throw new FlashcardNotFound();
    return flashcard.toPrimitives();
  }
}
