import type { Page, Route } from '@playwright/test';

const GAME_ID = 'e2e-game-1';
const FLASHCARD_ID = 'e2e-flashcard-1';
const DEVICE_ID = 'e2e-device-1';

const meta = {
  timestamp: new Date().toISOString(),
  request_id: 'e2e-request',
};

const envelope = <T>(data: T): { data: T; meta: typeof meta } => ({
  data,
  meta,
});

const encodeSegment = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

export const guestAccessToken = `${encodeSegment({ alg: 'none', typ: 'JWT' })}.${encodeSegment(
  {
    type: 'guest',
    roles: ['guest'],
    userId: 'guest-e2e',
  },
)}.e2e-signature`;

const flashcardPayload = [
  {
    id: FLASHCARD_ID,
    position: 1,
    expression: 'hello',
    meaning: 'hola',
    ipaNotation: '/həˈloʊ/',
    nativeSpeech: 'hello',
    audioUrls: {
      expression: { us: '', uk: '', au: '' },
      examples: { us: '' },
    },
    examples: [
      {
        id: 'ex-1',
        textEn: 'Hello there',
        textEs: 'Hola a todos',
        position: 1,
      },
    ],
  },
];

const fulfillJson = async (
  route: Route,
  body: unknown,
  status = 200,
): Promise<void> => {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
};

export async function installGuestGameApiMocks(page: Page): Promise<void> {
  await page.route('**/api/v1/**', async (route) => {
    const { pathname, search } = new URL(route.request().url());
    const method = route.request().method();

    if (pathname.endsWith('/analytics/page-views') && method === 'POST') {
      await fulfillJson(route, {});
      return;
    }

    if (pathname.endsWith('/auth/guest') && method === 'POST') {
      await fulfillJson(route, {
        accessToken: guestAccessToken,
        deviceId: DEVICE_ID,
      });
      return;
    }

    if (pathname.endsWith('/auth/refresh') && method === 'POST') {
      await fulfillJson(route, { accessToken: guestAccessToken });
      return;
    }

    if (pathname.endsWith('/flashcards/catalog') && method === 'GET') {
      await fulfillJson(route, envelope({ categories: [] }));
      return;
    }

    if (
      pathname.endsWith('/games') &&
      method === 'GET' &&
      search.includes('paused')
    ) {
      await fulfillJson(route, envelope([]));
      return;
    }

    if (pathname.endsWith('/games') && method === 'POST') {
      await fulfillJson(
        route,
        envelope({
          gameId: GAME_ID,
          flashcardIds: [FLASHCARD_ID],
        }),
      );
      return;
    }

    if (pathname.endsWith(`/games/${GAME_ID}/flashcards`) && method === 'GET') {
      await fulfillJson(route, envelope(flashcardPayload));
      return;
    }

    if (pathname.endsWith(`/games/${GAME_ID}/attempts`) && method === 'POST') {
      await fulfillJson(route, {});
      return;
    }

    if (pathname.endsWith(`/games/${GAME_ID}/complete`) && method === 'POST') {
      await fulfillJson(
        route,
        envelope({
          correctCount: 1,
          totalCount: 1,
          accuracy: 1,
          duration: 12,
          cardsViewed: 1,
        }),
      );
      return;
    }

    await route.continue();
  });
}

export { FLASHCARD_ID, GAME_ID };
