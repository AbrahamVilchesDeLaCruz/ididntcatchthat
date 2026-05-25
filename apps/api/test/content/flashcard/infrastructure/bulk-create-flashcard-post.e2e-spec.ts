import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { type App } from 'supertest/types';
import { createTestApp } from '../../../shared/infrastructure/create-test-app';
import { createAdminToken } from '../../../shared/infrastructure/create-admin-token';

const VALID_FLASHCARD_PAYLOAD = {
  expression: 'gonna',
  meaning: "Short form of 'going to'",
  category: 'connecting_words_in_speech',
  subcategory: 'WANNA_AND_GONNA',
  ipaNotation: 'ˈɡɒnə',
  nativeSpeech: null,
};

describe('content/flashcard BulkCreateFlashcardPostController (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;

  beforeEach(async () => {
    app = await createTestApp();
    adminToken = await createAdminToken(app);
  });

  afterEach(async () => {
    await app.close().catch(() => undefined);
  });

  describe('POST /api/v1/flashcards/bulk', () => {
    it('should return 201 with count when admin creates multiple flashcards', async () => {
      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();

      const res = await request(app.getHttpServer())
        .post('/api/v1/flashcards/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          flashcards: [
            {
              ...VALID_FLASHCARD_PAYLOAD,
              id: id1,
              examples: [
                {
                  id: crypto.randomUUID(),
                  flashcardId: id1,
                  textEn: "I'm gonna be late.",
                  textEs: 'Voy a llegar tarde.',
                  position: 1,
                },
              ],
            },
            {
              ...VALID_FLASHCARD_PAYLOAD,
              id: id2,
              expression: 'wanna',
              meaning: "Short form of 'want to'",
              examples: [
                {
                  id: crypto.randomUUID(),
                  flashcardId: id2,
                  textEn: 'I wanna go home.',
                  textEs: 'Quiero ir a casa.',
                  position: 1,
                },
              ],
            },
          ],
        })
        .expect(201);

      const body = res.body as { created: number };
      expect(body.created).toBe(2);
    });

    it('should return 422 when flashcards list is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/flashcards/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ flashcards: [] })
        .expect(422);
    });
  });
});
