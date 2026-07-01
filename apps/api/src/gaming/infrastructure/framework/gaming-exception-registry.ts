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
import { GameModeInvalid } from '@/gaming/domain/exceptions/game-mode-invalid';
import { GameModuleInvalid } from '@/gaming/domain/exceptions/game-module-invalid';
import { GameStatusInvalid } from '@/gaming/domain/exceptions/game-status-invalid';
import { GameIdInvalid } from '@/gaming/domain/exceptions/game-id-invalid';
import { CardCountInvalid } from '@/gaming/domain/exceptions/card-count-invalid';
import { InsufficientWeakFlashcards } from '@/gaming/domain/exceptions/insufficient-weak-flashcards';
import { WeakestSourceRequiresAuth } from '@/gaming/domain/exceptions/weakest-source-requires-auth';
import { StudyRequiresAuth } from '@/gaming/domain/exceptions/study-requires-auth';
import { ViewRequiresStudyMode } from '@/gaming/domain/exceptions/view-requires-study-mode';
import { AttemptRequiresGameMode } from '@/gaming/domain/exceptions/attempt-requires-game-mode';
import { WeakestSourceRequiresGameMode } from '@/gaming/domain/exceptions/weakest-source-requires-game-mode';

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
        [StudyRequiresAuth.name, HttpStatus.FORBIDDEN],
        [ViewRequiresStudyMode.name, HttpStatus.CONFLICT],
        [AttemptRequiresGameMode.name, HttpStatus.CONFLICT],
        [WeakestSourceRequiresGameMode.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [GameModeInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [GameModuleInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [GameStatusInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [GameIdInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
        [CardCountInvalid.name, HttpStatus.UNPROCESSABLE_ENTITY],
      ]),
    );
  }
}
