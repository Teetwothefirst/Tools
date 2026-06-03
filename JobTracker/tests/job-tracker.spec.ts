import { test, expect } from '@playwright/test';

test.describe('JobTracker E2E', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  // Note: For a fully fleshed E2E suite, we'd mock the Supabase auth or use a dedicated test user.
  // Since we are moving fast for the MVP, we just verify the basic routing and login page rendering.
  test('login page should render correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Sign in to your account');
    await expect(page.locator('button[type="submit"]')).toContainText('Sign in');
  });
});
