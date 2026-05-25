import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain tokens
import { FLASHCARD_REPOSITORY } from '@/content/flashcard/domain/flashcard.repository';
import { PDF_FLASHCARD_EXTRACTOR } from '@/content/flashcard/domain/pdf-flashcard-extractor';
import { DOMAIN_EVENT_PUBLISHER } from '@/shared/domain/domain-event-publisher';

// Infrastructure — persistence
import { FlashcardEntity } from '@/content/flashcard/infrastructure/persistence/flashcard.entity';
import { TypeOrmFlashcardRepository } from '@/content/flashcard/infrastructure/persistence/typeorm-flashcard.repository';

// Infrastructure — AI stubs
import { StubPdfFlashcardExtractor } from '@/content/flashcard/infrastructure/ai/stub-pdf-flashcard-extractor';

// Infrastructure — controllers
import { CreateFlashcardPostController } from '@/content/flashcard/infrastructure/controllers/create-flashcard-post.controller';
import { BulkCreateFlashcardPostController } from '@/content/flashcard/infrastructure/controllers/bulk-create-flashcard-post.controller';
import { FindFlashcardGetController } from '@/content/flashcard/infrastructure/controllers/find-flashcard-get.controller';
import { SearchFlashcardsGetController } from '@/content/flashcard/infrastructure/controllers/search-flashcards-get.controller';
import { UpdateFlashcardPatchController } from '@/content/flashcard/infrastructure/controllers/update-flashcard-patch.controller';
import { ImportPdfFlashcardPostController } from '@/content/flashcard/infrastructure/controllers/import-pdf-flashcard-post.controller';

// Infrastructure — exception registry
import { ContentExceptionRegistry } from './content-exception-registry';

// Application — use cases
import { FlashcardCreator } from '@/content/flashcard/application/create/flashcard-creator';
import { FlashcardBulkCreator } from '@/content/flashcard/application/bulk-create/flashcard-bulk-creator';
import { FlashcardFinder } from '@/content/flashcard/application/find/flashcard-finder';
import { FlashcardSearcher } from '@/content/flashcard/application/search/flashcard-searcher';
import { FlashcardUpdater } from '@/content/flashcard/application/update/flashcard-updater';
import { PdfFlashcardImporter } from '@/content/flashcard/application/import-pdf/pdf-flashcard-importer';

// Shared modules
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';

// Domain event publisher stub (real implementation pending events infra)
import { NoopDomainEventPublisher } from './noop-domain-event-publisher';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([FlashcardEntity]),
  ],
  controllers: [
    CreateFlashcardPostController,
    BulkCreateFlashcardPostController,
    FindFlashcardGetController,
    SearchFlashcardsGetController,
    UpdateFlashcardPatchController,
    ImportPdfFlashcardPostController,
  ],
  providers: [
    // Repositories
    { provide: FLASHCARD_REPOSITORY, useClass: TypeOrmFlashcardRepository },

    // External ports (stubs)
    // TODO: replace with real ElevenLabs implementation — see issue #XXX
    { provide: PDF_FLASHCARD_EXTRACTOR, useClass: StubPdfFlashcardExtractor },
    { provide: DOMAIN_EVENT_PUBLISHER, useClass: NoopDomainEventPublisher },

    // Use cases
    FlashcardCreator,
    FlashcardBulkCreator,
    FlashcardFinder,
    FlashcardSearcher,
    FlashcardUpdater,
    PdfFlashcardImporter,

    // Exception registry
    ContentExceptionRegistry,
  ],
})
export class ContentModule {}
