import { test, expect } from '@playwright/test';
import { installGuestGameApiMocks } from './fixtures/mock-api';

test.describe('guest game smoke', () => {
  test.beforeEach(async ({ page }) => {
    await installGuestGameApiMocks(page);
  });

  test('landing → guest → play → summary', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Play now' }).first().click();
    await page.getByRole('button', { name: /Play as guest/i }).click();

    await expect(page).toHaveURL(/\/game\/e2e-game-1$/);

    const frontCard = page
      .locator('.flashcard-card-face')
      .first()
      .getByText('Hello', { exact: true });
    await expect(frontCard).toBeVisible();
    await frontCard.click();
    await page.getByRole('button', { name: 'I knew it' }).click();

    await expect(page).toHaveURL(/\/game\/e2e-game-1\/summary$/);
    await expect(
      page.getByRole('heading', { name: 'Game over!' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Save my progress' }),
    ).toBeVisible();
  });
});
