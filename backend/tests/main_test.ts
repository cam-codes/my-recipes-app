import { assertEquals } from "@std/assert";
import { createApp } from "../main.ts";
import { request } from "./fixtures/utils/utils.ts";

const fixturesDir = new URL("./fixtures/recipes/", import.meta.url);
const resumeFile = new URL("./fixtures/resume/resume.md", import.meta.url);
const app = createApp({
  recipesDir: fixturesDir,
  resumeFile: resumeFile
});

Deno.test("GET /health", async () => {
  const { status, body } = await request(app, "/health");
  assertEquals(status, 200);

  const json = JSON.parse(body as string);
  assertEquals(json.status, "OK");
});

