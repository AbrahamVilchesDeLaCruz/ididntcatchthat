import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { GlobalExceptionRegistry } from '@/shared/infrastructure/exceptions/global-exception-registry';
import { AudioStatusInvalid } from '@/content/flashcard/domain/exceptions/audio-status-invalid';
import { AudioUrlsInvalid } from '@/content/flashcard/domain/exceptions/audio-urls-invalid';
import { BulkEmptyFlashcards } from '@/content/flashcard/domain/exceptions/bulk-empty-flashcards';
import { CategoryInvalid } from '@/content/flashcard/domain/exceptions/category-invalid';
import { ExampleIdInvalid } from '@/content/flashcard/domain/exceptions/example-id-invalid';
import { ExamplePositionInvalid } from '@/content/flashcard/domain/exceptions/example-position-invalid';
import { ExampleTextEnEmpty } from '@/content/flashcard/domain/exceptions/example-text-en-empty';
import { ExampleTextEsEmpty } from '@/content/flashcard/domain/exceptions/example-text-es-empty';
import { ExpressionEmpty } from '@/content/flashcard/domain/exceptions/expression-empty';
import { ExpressionTooLong } from '@/content/flashcard/domain/exceptions/expression-too-long';
import { FlashcardAccessDenied } from '@/content/flashcard/domain/exceptions/flashcard-access-denied';
import { FlashcardIdInvalid } from '@/shared/domain/exceptions/flashcard-id-invalid';
import { FlashcardNotFound } from '@/content/flashcard/domain/exceptions/flashcard-not-found';
import { InvalidCriteriaField } from '@/content/flashcard/domain/exceptions/invalid-criteria-field';
import { InvalidExampleCount } from '@/content/flashcard/domain/exceptions/invalid-example-count';
import { InvalidSubcategory } from '@/content/flashcard/domain/exceptions/invalid-subcategory';
import { IpaNotationEmpty } from '@/content/flashcard/domain/exceptions/ipa-notation-empty';
import { MeaningEmpty } from '@/content/flashcard/domain/exceptions/meaning-empty';
import { MeaningTooLong } from '@/content/flashcard/domain/exceptions/meaning-too-long';
import { NativeSpeechEmpty } from '@/content/flashcard/domain/exceptions/native-speech-empty';

@Injectable()
export class ContentExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit(): void {
    this.globalRegistry.register(
      new Map<string, number>([
        [FlashcardNotFound.name, HttpStatus.NOT_FOUND],
        [FlashcardAccessDenied.name, HttpStatus.FORBIDDEN],
        [AudioStatusInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [AudioUrlsInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [BulkEmptyFlashcards.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [CategoryInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [ExampleIdInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [ExamplePositionInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [ExampleTextEnEmpty.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [ExampleTextEsEmpty.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [ExpressionEmpty.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [ExpressionTooLong.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [FlashcardIdInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [InvalidCriteriaField.name, HttpStatus.BAD_REQUEST],
        [InvalidExampleCount.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [InvalidSubcategory.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [IpaNotationEmpty.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [MeaningEmpty.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [MeaningTooLong.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [NativeSpeechEmpty.name, HttpStatus.UNPROCESSABLE_ENTITY],
      ]),
    );
  }
}
