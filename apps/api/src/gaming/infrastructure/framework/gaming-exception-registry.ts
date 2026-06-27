import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { GlobalExceptionRegistry } from '@/shared/infrastructure/exceptions/global-exception-registry';
import { GameNotFound } from '@/gaming/domain/exceptions/game-not-found';
import { GameAccessDenied } from '@/gaming/domain/exceptions/game-access-denied';
import { GameNotInProgress } from '@/gaming/domain/exceptions/game-not-in-progress';
import { GameNotPaused } from '@/gaming/domain/exceptions/game-not-paused';
import { GameAlreadyFinished } from '@/gaming/domain/exceptions/game-already-finished';
import { GameNotFinished } from '@/gaming/domain/exceptions/game-not-finished';
import { FlashcardNotInGame } from '@/gaming/domain/exceptions/flashcard-not-in-game';
import { MaxPausedGamesReached } from '@/gaming/domain/exceptions/max-paused-games-reached';
import { GuestLimitExceeded } from '@/gaming/domain/exceptions/guest-limit-exceeded';
import { GameSubcategoryInvalid } from '@/gaming/domain/exceptions/game-subcategory-invalid';
import { InsufficientWeakFlashcards } from '@/gaming/domain/exceptions/insufficient-weak-flashcards';
import { WeakestSourceRequiresAuth } from '@/gaming/domain/exceptions/weakest-source-requires-auth';

@Injectable()
export class GamingExceptionRegistry implements OnModuleInit {
  constructor(private readonly globalRegistry: GlobalExceptionRegistry) {}

  onModuleInit(): void {
    this.globalRegistry.register(
      new Map<string, number>([
        [GameNotFound.name, HttpStatus.NOT_FOUND],
        [GameAccessDenied.name, HttpStatus.FORBIDDEN],
        [GameNotInProgress.name, HttpStatus.CONFLICT],
        [GameNotPaused.name, HttpStatus.CONFLICT],
        [GameAlreadyFinished.name, HttpStatus.CONFLICT],
        [GameNotFinished.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [FlashcardNotInGame.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [MaxPausedGamesReached.name, HttpStatus.CONFLICT],
        [GuestLimitExceeded.name, HttpStatus.TOO_MANY_REQUESTS],
        [GameSubcategoryInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [InsufficientWeakFlashcards.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [WeakestSourceRequiresAuth.name, HttpStatus.FORBIDDEN],
      ]),
    );
  }
}
