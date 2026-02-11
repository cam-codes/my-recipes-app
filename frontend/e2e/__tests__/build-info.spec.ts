import { test, expect } from '@playwright/test';

test('build info is rendered and links correctly', async ({ page }) => {
  await page.goto('/');

  // Build Info button exists
  const button = page.getByRole('button', { name: /build info/i });
  await expect(button).toBeVisible();

  // Open dropdown
  await button.click();

  // Commit label rendered
  await expect(page.getByText(/Commit:|Release:/i)).toBeVisible();

  // 'HEAD', 7-digit short SHA, or release version (vX.Y.Z.) rendered
  const sha = page.locator('text=/HEAD|[a-f0-9]{7}|v\\d\\.\\d\\.\\d/');
  await expect(sha).toBeVisible();

  // Link exists and points to GitHub
  const dropdown = page.locator('div[role="menu"], .ring-1').first();
  const link = dropdown.getByRole('link');
  await expect(link).toHaveAttribute('href', /github\.com/);
});
