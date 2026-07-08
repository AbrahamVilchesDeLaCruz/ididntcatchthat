import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FLASHCARD_REPOSITORY } from '@/content/flashcard/domain/flashcard.repository';
import {
  AI_EXAMPLE_GENERATOR,
  type AiExampleGenerator,
} from '@/content/flashcard/domain/ai-example-generator';
import {
  AI_PHONETICS_GENERATOR,
  type AiPhoneticsGenerator,
} from '@/content/flashcard/domain/ai-phonetics-generator';
import {
  FLASHCARD_DRAFT_GENERATOR,
  type FlashcardDraftGeneratorPort,
} from '@/content/flashcard/domain/flashcard-draft-generator';
import {
  AUDIO_GENERATOR,
  type AudioGenerator,
} from '@/content/flashcard/domain/audio-generator';
import { AUDIO_STORAGE } from '@/content/flashcard/domain/audio-storage';
import { SUBSCRIBERS } from '@/shared/infrastructure/event-bus/subscribers-bootstrapper';
import { type Subscriber } from '@/shared/application/subscriber';
import { FlashcardEntity } from '@/content/flashcard/infrastructure/persistence/flashcard.entity';
import { TypeOrmFlashcardRepository } from '@/content/flashcard/infrastructure/persistence/typeorm-flashcard.repository';

// Infrastructure — AI
import { DeepSeekAiExampleGenerator } from '@/content/flashcard/infrastructure/ai/deepseek-ai-example-generator';
import { DeepSeekAiPhoneticsGenerator } from '@/content/flashcard/infrastructure/ai/deepseek-ai-phonetics-generator';
import { DeepSeekFlashcardDraftGenerator } from '@/content/flashcard/infrastructure/ai/deepseek-flashcard-draft-generator';
import { StubAiExampleGenerator } from '@/content/flashcard/infrastructure/adapters/local/stub-ai-example-generator';
import { StubAiPhoneticsGenerator } from '@/content/flashcard/infrastructure/adapters/local/stub-ai-phonetics-generator';
import { StubFlashcardDraftGenerator } from '@/content/flashcard/infrastructure/adapters/local/stub-flashcard-draft-generator';

// Infrastructure — audio
import { ElevenLabsAudioGenerator } from '@/content/flashcard/infrastructure/audio/elevenlabs-audio-generator';
import { R2AudioStorage } from '@/content/flashcard/infrastructure/audio/r2-audio-storage';
import { StubAudioGenerator } from '@/content/flashcard/infrastructure/adapters/local/stub-audio-generator';
import { useStubAdapters } from '@/shared/infrastructure/config/use-stub-adapters';

// Infrastructure — event bus
import { SubscribersBootstrapper } from '@/shared/infrastructure/event-bus/subscribers-bootstrapper';

// Infrastructure — controllers
import { CreateFlashcardPostController } from '@/content/flashcard/infrastructure/controllers/create-flashcard-post.controller';
import { BulkCreateFlashcardPostController } from '@/content/flashcard/infrastructure/controllers/bulk-create-flashcard-post.controller';
import { FindFlashcardGetController } from '@/content/flashcard/infrastructure/controllers/find-flashcard-get.controller';
import { SearchFlashcardsGetController } from '@/content/flashcard/infrastructure/controllers/search-flashcards-get.controller';
import { UpdateFlashcardPatchController } from '@/content/flashcard/infrastructure/controllers/update-flashcard-patch.controller';
import { DeleteFlashcardDeleteController } from '@/content/flashcard/infrastructure/controllers/delete-flashcard-delete.controller';
import { RegenerateFlashcardAudioPostController } from '@/content/flashcard/infrastructure/controllers/regenerate-flashcard-audio-post.controller';
import { SearchFlashcardCatalogGetController } from '@/content/flashcard/infrastructure/controllers/search-flashcard-catalog-get.controller';
import { SuggestExamplesPostController } from '@/content/flashcard/infrastructure/controllers/suggest-examples-post.controller';
import { GenerateFlashcardsPostController } from '@/content/flashcard/infrastructure/controllers/generate-flashcards-post.controller';

// Infrastructure — exception registry
import { ContentExceptionRegistry } from './content-exception-registry';

// Application — use cases
import { FlashcardCreator } from '@/content/flashcard/application/create/flashcard-creator';
import { FlashcardBulkCreator } from '@/content/flashcard/application/bulk-create/flashcard-bulk-creator';
import { FlashcardFinder } from '@/content/flashcard/application/find/flashcard-finder';
import { FlashcardSearcher } from '@/content/flashcard/application/search/flashcard-searcher';
import { FlashcardUpdater } from '@/content/flashcard/application/update/flashcard-updater';
import { FlashcardRemover } from '@/content/flashcard/application/remove/flashcard-remover';
import { FlashcardAudioRegenerator } from '@/content/flashcard/application/regenerate-audio/flashcard-audio-regenerator';
import { FlashcardCatalogQuerier } from '@/content/flashcard/application/catalog/flashcard-catalog-querier';
import { FlashcardAudioGenerator } from '@/content/flashcard/application/generate-audio/flashcard-audio-generator';
import { AiExamplesCompleter } from '@/content/flashcard/application/complete-examples/ai-examples-completer';
import { AiPhoneticsCompleter } from '@/content/flashcard/application/complete-phonetics/ai-phonetics-completer';
import { AiExampleSuggester } from '@/content/flashcard/application/suggest-examples/ai-example-suggester';
import { AiFlashcardDraftGenerator } from '@/content/flashcard/application/generate-drafts/ai-flashcard-draft-generator';

// Application — event subscribers
import { EnrichFlashcardOnFlashcardCreated } from '@/content/flashcard/application/enrich/enrich-flashcard-on-flashcard-created';
import { GenerateFlashcardAudioOnFlashcardExamplesCompleted } from '@/content/flashcard/application/generate-audio/generate-flashcard-audio-on-flashcard-examples-completed';
import { GenerateFlashcardAudioOnFlashcardExpressionUpdated } from '@/content/flashcard/application/generate-audio/generate-flashcard-audio-on-flashcard-expression-updated';
import { GenerateFlashcardAudioOnFlashcardExamplesUpdated } from '@/content/flashcard/application/generate-audio/generate-flashcard-audio-on-flashcard-examples-updated';

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
    SearchFlashcardCatalogGetController,
    FindFlashcardGetController,
    SearchFlashcardsGetController,
    UpdateFlashcardPatchController,
    DeleteFlashcardDeleteController,
    RegenerateFlashcardAudioPostController,
    SuggestExamplesPostController,
    GenerateFlashcardsPostController,
  ],
  providers: [
    // Repositories
    { provide: FLASHCARD_REPOSITORY, useClass: TypeOrmFlashcardRepository },

    // AI ports
    {
      provide: AI_EXAMPLE_GENERATOR,
      useFactory: (config: ConfigService): AiExampleGenerator =>
        useStubAdapters(config)
          ? new StubAiExampleGenerator()
          : new DeepSeekAiExampleGenerator(config),
      inject: [ConfigService],
    },
    {
      provide: AI_PHONETICS_GENERATOR,
      useFactory: (config: ConfigService): AiPhoneticsGenerator =>
        useStubAdapters(config)
          ? new StubAiPhoneticsGenerator()
          : new DeepSeekAiPhoneticsGenerator(config),
      inject: [ConfigService],
    },
    {
      provide: FLASHCARD_DRAFT_GENERATOR,
      useFactory: (config: ConfigService): FlashcardDraftGeneratorPort =>
        useStubAdapters(config)
          ? new StubFlashcardDraftGenerator()
          : new DeepSeekFlashcardDraftGenerator(config),
      inject: [ConfigService],
    },

    // Audio ports — R2AudioStorage targets MinIO when CLOUD_STORAGE is localhost
    {
      provide: AUDIO_GENERATOR,
      useFactory: (config: ConfigService): AudioGenerator =>
        useStubAdapters(config)
          ? new StubAudioGenerator()
          : new ElevenLabsAudioGenerator(config),
      inject: [ConfigService],
    },
    { provide: AUDIO_STORAGE, useClass: R2AudioStorage },

    // Event subscribers
    EnrichFlashcardOnFlashcardCreated,
    GenerateFlashcardAudioOnFlashcardExamplesCompleted,
    GenerateFlashcardAudioOnFlashcardExpressionUpdated,
    GenerateFlashcardAudioOnFlashcardExamplesUpdated,
    {
      provide: SUBSCRIBERS,
      useFactory: (
        enrich: EnrichFlashcardOnFlashcardCreated,
        audioOnExamplesCompleted: GenerateFlashcardAudioOnFlashcardExamplesCompleted,
        audioOnExpressionUpdated: GenerateFlashcardAudioOnFlashcardExpressionUpdated,
        audioOnExamplesUpdated: GenerateFlashcardAudioOnFlashcardExamplesUpdated,
      ): Subscriber[] => [
        enrich,
        audioOnExamplesCompleted,
        audioOnExpressionUpdated,
        audioOnExamplesUpdated,
      ],
      inject: [
        EnrichFlashcardOnFlashcardCreated,
        GenerateFlashcardAudioOnFlashcardExamplesCompleted,
        GenerateFlashcardAudioOnFlashcardExpressionUpdated,
        GenerateFlashcardAudioOnFlashcardExamplesUpdated,
      ],
    },
    SubscribersBootstrapper,

    // Use cases
    FlashcardCreator,
    FlashcardBulkCreator,
    FlashcardFinder,
    FlashcardSearcher,
    FlashcardUpdater,
    FlashcardRemover,
    FlashcardAudioRegenerator,
    FlashcardCatalogQuerier,
    FlashcardAudioGenerator,
    AiExamplesCompleter,
    AiPhoneticsCompleter,
    AiExampleSuggester,
    AiFlashcardDraftGenerator,

    // Exception registry
    ContentExceptionRegistry,
  ],
})
export class ContentModule {}
