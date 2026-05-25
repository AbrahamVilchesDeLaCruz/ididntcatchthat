import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain tokens
import { FLASHCARD_REPOSITORY } from '@/content/flashcard/domain/flashcard.repository';
import { PDF_FLASHCARD_EXTRACTOR } from '@/content/flashcard/domain/pdf-flashcard-extractor';
import { AI_EXAMPLE_GENERATOR } from '@/content/flashcard/domain/ai-example-generator';
import { AI_PHONETICS_GENERATOR } from '@/content/flashcard/domain/ai-phonetics-generator';
import { AUDIO_GENERATOR } from '@/content/flashcard/domain/audio-generator';
import { AUDIO_STORAGE } from '@/content/flashcard/domain/audio-storage';
import { DOMAIN_EVENT_PUBLISHER } from '@/shared/domain/domain-event-publisher';
import { DOMAIN_EVENT_CONSUMER } from '@/shared/application/domain-event-consumer';
import { HANDLERS } from '@/shared/infrastructure/event-bus/handlers-bootstrapper';
import { Handler } from '@/shared/application/handler';

// Infrastructure — persistence
import { FlashcardEntity } from '@/content/flashcard/infrastructure/persistence/flashcard.entity';
import { TypeOrmFlashcardRepository } from '@/content/flashcard/infrastructure/persistence/typeorm-flashcard.repository';

// Infrastructure — AI
import { DeepSeekAiExampleGenerator } from '@/content/flashcard/infrastructure/ai/deepseek-ai-example-generator';
import { DeepSeekAiPhoneticsGenerator } from '@/content/flashcard/infrastructure/ai/deepseek-ai-phonetics-generator';
import { DeepSeekPdfFlashcardExtractor } from '@/content/flashcard/infrastructure/ai/deepseek-pdf-flashcard-extractor';

// Infrastructure — audio
import { ElevenLabsAudioGenerator } from '@/content/flashcard/infrastructure/audio/elevenlabs-audio-generator';
import { R2AudioStorage } from '@/content/flashcard/infrastructure/audio/r2-audio-storage';

// Infrastructure — event bus
import { AmqpMessageBus } from '@/shared/infrastructure/event-bus/amqp-message-bus';
import { HandlersBootstrapper } from '@/shared/infrastructure/event-bus/handlers-bootstrapper';

// Infrastructure — controllers
import { CreateFlashcardPostController } from '@/content/flashcard/infrastructure/controllers/create-flashcard-post.controller';
import { BulkCreateFlashcardPostController } from '@/content/flashcard/infrastructure/controllers/bulk-create-flashcard-post.controller';
import { FindFlashcardGetController } from '@/content/flashcard/infrastructure/controllers/find-flashcard-get.controller';
import { SearchFlashcardsGetController } from '@/content/flashcard/infrastructure/controllers/search-flashcards-get.controller';
import { UpdateFlashcardPatchController } from '@/content/flashcard/infrastructure/controllers/update-flashcard-patch.controller';
import { ImportPdfFlashcardPostController } from '@/content/flashcard/infrastructure/controllers/import-pdf-flashcard-post.controller';
import { GetFlashcardCatalogGetController } from '@/content/flashcard/infrastructure/controllers/get-flashcard-catalog-get.controller';
import { SuggestExamplesPostController } from '@/content/flashcard/infrastructure/controllers/suggest-examples-post.controller';

// Infrastructure — exception registry
import { ContentExceptionRegistry } from './content-exception-registry';

// Application — use cases
import { FlashcardCreator } from '@/content/flashcard/application/create/flashcard-creator';
import { FlashcardBulkCreator } from '@/content/flashcard/application/bulk-create/flashcard-bulk-creator';
import { FlashcardFinder } from '@/content/flashcard/application/find/flashcard-finder';
import { FlashcardSearcher } from '@/content/flashcard/application/search/flashcard-searcher';
import { FlashcardUpdater } from '@/content/flashcard/application/update/flashcard-updater';
import { PdfFlashcardImporter } from '@/content/flashcard/application/import-pdf/pdf-flashcard-importer';
import { FlashcardCatalogQuerier } from '@/content/flashcard/application/catalog/flashcard-catalog-querier';
import { FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { AiExamplesCompleter } from '@/content/flashcard/application/complete-examples/ai-examples-completer';
import { AiPhoneticsCompleter } from '@/content/flashcard/application/complete-phonetics/ai-phonetics-completer';
import { AiExampleSuggester } from '@/content/flashcard/application/suggest-examples/ai-example-suggester';

// Application — event handlers
import { GenerateFlashcardExamplesOnFlashcardCreated } from '@/content/flashcard/application/event-handlers/generate-flashcard-examples-on-flashcard-created';
import { GenerateFlashcardPhoneticsOnFlashcardCreated } from '@/content/flashcard/application/event-handlers/generate-flashcard-phonetics-on-flashcard-created';
import { GenerateFlashcardAudioOnFlashcardExamplesCompleted } from '@/content/flashcard/application/event-handlers/generate-flashcard-audio-on-flashcard-examples-completed';

// Shared modules
import { SharedModule } from '@/shared/infrastructure/framework/shared.module';
import { AuthModule } from '@/shared/infrastructure/auth/auth.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([FlashcardEntity]),
  ],
  controllers: [
    CreateFlashcardPostController,
    BulkCreateFlashcardPostController,
    GetFlashcardCatalogGetController,
    FindFlashcardGetController,
    SearchFlashcardsGetController,
    UpdateFlashcardPatchController,
    ImportPdfFlashcardPostController,
    SuggestExamplesPostController,
  ],
  providers: [
    // Repositories
    { provide: FLASHCARD_REPOSITORY, useClass: TypeOrmFlashcardRepository },

    // AI ports
    { provide: AI_EXAMPLE_GENERATOR, useClass: DeepSeekAiExampleGenerator },
    { provide: AI_PHONETICS_GENERATOR, useClass: DeepSeekAiPhoneticsGenerator },
    {
      provide: PDF_FLASHCARD_EXTRACTOR,
      useClass: DeepSeekPdfFlashcardExtractor,
    },

    // Audio ports
    { provide: AUDIO_GENERATOR, useClass: ElevenLabsAudioGenerator },
    { provide: AUDIO_STORAGE, useClass: R2AudioStorage },

    // Event bus (AMQP)
    AmqpMessageBus,
    { provide: DOMAIN_EVENT_PUBLISHER, useExisting: AmqpMessageBus },
    { provide: DOMAIN_EVENT_CONSUMER, useExisting: AmqpMessageBus },

    // Event handlers
    GenerateFlashcardExamplesOnFlashcardCreated,
    GenerateFlashcardPhoneticsOnFlashcardCreated,
    GenerateFlashcardAudioOnFlashcardExamplesCompleted,
    {
      provide: HANDLERS,
      useFactory: (
        h1: GenerateFlashcardExamplesOnFlashcardCreated,
        h2: GenerateFlashcardPhoneticsOnFlashcardCreated,
        h3: GenerateFlashcardAudioOnFlashcardExamplesCompleted,
      ): Handler[] => [h1, h2, h3],
      inject: [
        GenerateFlashcardExamplesOnFlashcardCreated,
        GenerateFlashcardPhoneticsOnFlashcardCreated,
        GenerateFlashcardAudioOnFlashcardExamplesCompleted,
      ],
    },
    HandlersBootstrapper,

    // Use cases
    FlashcardCreator,
    FlashcardBulkCreator,
    FlashcardFinder,
    FlashcardSearcher,
    FlashcardUpdater,
    PdfFlashcardImporter,
    FlashcardCatalogQuerier,
    FlashcardAudioGenerator,
    AiExamplesCompleter,
    AiPhoneticsCompleter,
    AiExampleSuggester,

    // Exception registry
    ContentExceptionRegistry,
  ],
})
export class ContentModule {}
