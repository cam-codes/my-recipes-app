import { assertEquals } from "@std/assert";
import { createApp } from "../main.ts";
import { superoak } from "superoak";
import { request } from "./fixtures/utils/utils.ts";

const fixturesDir = new URL("./fixtures/recipes/", import.meta.url);
const resumeFile = new URL("./fixtures/resume/resume.md", import.meta.url);
const options = {
  recipesDir: fixturesDir,
  resumeFile: resumeFile
}

Deno.test("GET /build-info returns env vars or defaults", async () => {
  // Mock env vars
  Deno.env.set("GIT_COMMIT", "abc123456789");
  Deno.env.set("APP_VERSION", "1.2.3");
  Deno.env.set("BUILD_DATE", "2026-02-03T12:00:00Z");

  const app = createApp(options);

  const { status, body } = await request(app, "/build-info");
  const json = JSON.parse(body as string);

  assertEquals(status, 200);
  assertEquals(json.commit, "abc123456789");
  assertEquals(json.version, "1.2.3");
  assertEquals(json.buildDate, "2026-02-03T12:00:00Z");

  // Cleanup
  Deno.env.delete("GIT_COMMIT");
  Deno.env.delete("APP_VERSION");
  Deno.env.delete("BUILD_DATE");
});

Deno.test("GET /build-info falls back to defaults when env vars missing", async () => {
  Deno.env.delete("GIT_COMMIT");
  Deno.env.delete("APP_VERSION");
  Deno.env.delete("BUILD_DATE");

  const app = createApp(options);
  const { status, body } = await request(app, "/build-info");
  const json = JSON.parse(body as string);

  assertEquals(status, 200);
  assertEquals(json.commit, "unknown");
  assertEquals(json.version, "dev");
  // buildDate should be a recent ISO string – just check it's a string
  assertEquals(typeof json.buildDate, "string");
});
