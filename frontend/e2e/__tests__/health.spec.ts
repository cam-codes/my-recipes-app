import { test, expect } from '@playwright/test';
import {request} from "../../../backend/tests/fixtures/utils/utils.ts";

test('backend health check is reachable', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBe(true);
});
