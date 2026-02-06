import { assertEquals } from "@std/assert";
import { createApp } from "../main.ts";
import { request } from "./fixtures/utils/utils.ts";

const fixturesDir = new URL("./fixtures/recipes/", import.meta.url);
const resumeFile = new URL("./fixtures/resume/resume.md", import.meta.url);
const options = {
  recipesDir: fixturesDir,
  resumeFile: resumeFile,
};

Deno.test("GET /build-info returns env vars or defaults", async () => {
  // Mock env vars
  Deno.env.set("GIT_COMMIT", "abc123456789");
  Deno.env.set("GIT_TAG", "v1.2.3");

  const app = createApp(options);

  const { status, body } = await request(app, "/build-info");
  const json = JSON.parse(body as string);

  assertEquals(status, 200);
  assertEquals(json.commit, "abc123456789");
  assertEquals(json.tag, "v1.2.3");

  // Cleanup
  Deno.env.delete("GIT_COMMIT");
  Deno.env.delete("GIT_TAG");
});

Deno.test("GET /build-info falls back to defaults when env vars missing", async () => {
  Deno.env.delete("GIT_COMMIT");
  Deno.env.delete("GIT_TAG");

  const app = createApp(options);
  const { status, body } = await request(app, "/build-info");
  const json = JSON.parse(body as string);

  assertEquals(status, 200);
  assertEquals(json.commit, "unknown");
  assertEquals(json.tag, "");
});
