import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { type App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import { AI_EXAMPLE_GENERATOR } from '../../../src/content/flashcard/domain/ai-example-generator';
import { AI_PHONETICS_GENERATOR } from '../../../src/content/flashcard/domain/ai-phonetics-generator';
import { AUDIO_GENERATOR } from '../../../src/content/flashcard/domain/audio-generator';
import { AUDIO_STORAGE } from '../../../src/content/flashcard/domain/audio-storage';
import { LOGGER_SERVICE } from '../../../src/shared/domain/logger';
import { DOMAIN_EVENT_PUBLISHER } from '../../../src/shared/domain/domain-event-publisher';
import { AmqpMessageBus } from '../../../src/shared/infrastructure/event-bus/amqp-message-bus';
import { NullLogger } from '../null-logger';
import { E2eDomainEventPublisher } from './e2e-domain-event-publisher';

const e2eExampleGenerator = {
  generate: (): Promise<{ textEn: string; textEs: string }[]> =>
    Promise.resolve([
      { textEn: 'Example one', textEs: 'Ejemplo uno' },
      { textEn: 'Example two', textEs: 'Ejemplo dos' },
    ]),
};

const e2ePhoneticsGenerator = {
  generate: (): Promise<{ ipaNotation: string; nativeSpeech: string }> =>
    Promise.resolve({
      ipaNotation: '/test/',
      nativeSpeech: 'test',
    }),
};

const e2eAudioGenerator = {
  generate: (): Promise<Buffer> => Promise.resolve(Buffer.from('audio')),
};

const e2eAudioStorage = {
  upload: (key: string): Promise<string> =>
    Promise.resolve(`https://example.com/${key}`),
};

export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(LOGGER_SERVICE)
    .useClass(NullLogger)
    .overrideProvider(AI_EXAMPLE_GENERATOR)
    .useValue(e2eExampleGenerator)
    .overrideProvider(AI_PHONETICS_GENERATOR)
    .useValue(e2ePhoneticsGenerator)
    .overrideProvider(AUDIO_GENERATOR)
    .useValue(e2eAudioGenerator)
    .overrideProvider(AUDIO_STORAGE)
    .useValue(e2eAudioStorage)
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
