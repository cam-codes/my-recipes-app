import { test, expect } from '@playwright/test';

test('recipe detail page loads and renders content', async ({ page }) => {
  // Use a known recipe slug that always exists
  await page.goto('/recipe/steak-tips');

  // Scope to the article
  const article = page.getByRole('article');

  // Recipe title
  const titleHeading = article.getByRole('heading', { level: 1 });
  await expect(titleHeading).toContainText(/steak tips/i);

  // Ingredients section
  const ingredientsList = article.locator('ul').first();
  await expect(ingredientsList).toBeVisible();
  const ingredientCount = await ingredientsList.getByRole('listitem').count();
  expect(ingredientCount).toBe(11);

  // Instructions section
  const instructionsList = article.locator('ol');
  await expect(instructionsList).toBeVisible();
  const instructionCount = await instructionsList.getByRole('listitem').count();
  expect(instructionCount).toBe(7);

  // Tips list section
  const tipsList = article.locator('ul').last();
  await expect(tipsList).toBeVisible();

  const tipItems = tipsList.getByRole('listitem');
  const tipCount = await tipItems.count();
  expect(tipCount).toBe(2);
});
