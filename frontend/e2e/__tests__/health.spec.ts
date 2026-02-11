import { test, expect } from '@playwright/test';

test('backend health check is reachable', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBe(true);
});
