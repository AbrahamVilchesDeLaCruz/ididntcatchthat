import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { type App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import { AI_EXAMPLE_GENERATOR } from '../../../src/content/flashcard/domain/ai-example-generator';
import { AI_PHONETICS_GENERATOR } from '../../../src/content/flashcard/domain/ai-phonetics-generator';
import { FLASHCARD_DRAFT_GENERATOR } from '../../../src/content/flashcard/domain/flashcard-draft-generator';
import { AUDIO_GENERATOR } from '../../../src/content/flashcard/domain/audio-generator';
import { AUDIO_STORAGE } from '../../../src/content/flashcard/domain/audio-storage';
import { StubAiExampleGenerator } from '../../../src/content/flashcard/infrastructure/adapters/local/stub-ai-example-generator';
import { StubAiPhoneticsGenerator } from '../../../src/content/flashcard/infrastructure/adapters/local/stub-ai-phonetics-generator';
import { StubFlashcardDraftGenerator } from '../../../src/content/flashcard/infrastructure/adapters/local/stub-flashcard-draft-generator';
import { StubAudioGenerator } from '../../../src/content/flashcard/infrastructure/adapters/local/stub-audio-generator';
import { StubAudioStorage } from '../../../src/content/flashcard/infrastructure/adapters/local/stub-audio-storage';
import { LOGGER_SERVICE } from '../../../src/shared/domain/logger';
import { DOMAIN_EVENT_PUBLISHER } from '../../../src/shared/domain/domain-event-publisher';
import { AmqpMessageBus } from '../../../src/shared/infrastructure/event-bus/amqp-message-bus';
import { NullLogger } from '../null-logger';
import { E2eDomainEventPublisher } from './e2e-domain-event-publisher';

export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(LOGGER_SERVICE)
    .useClass(NullLogger)
    .overrideProvider(AI_EXAMPLE_GENERATOR)
    .useClass(StubAiExampleGenerator)
    .overrideProvider(AI_PHONETICS_GENERATOR)
    .useClass(StubAiPhoneticsGenerator)
    .overrideProvider(FLASHCARD_DRAFT_GENERATOR)
    .useClass(StubFlashcardDraftGenerator)
    .overrideProvider(AUDIO_GENERATOR)
    .useClass(StubAudioGenerator)
    .overrideProvider(AUDIO_STORAGE)
    .useClass(StubAudioStorage)
    .overrideProvider(DOMAIN_EVENT_PUBLISHER)
    .useFactory({
      factory: (messageBus: AmqpMessageBus) =>
        new E2eDomainEventPublisher(messageBus),
      inject: [AmqpMessageBus],
    })
    .compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();

  app.useLogger(false);
  app.setGlobalPrefix('v1', { exclude: ['/health', '/metrics'] });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422,
    }),
  );

  await app.init();
  return app;
}
