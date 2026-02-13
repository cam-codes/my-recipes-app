import { assertEquals } from "@std/assert";
import { createApp } from "../main.ts";
import { request } from "./fixtures/utils/utils.ts";
import { toFileUrl } from "std/path/mod.ts";

const fixturesDir = new URL("./fixtures/recipes/", import.meta.url);
const resumeFile = new URL("./fixtures/resume/resume.md", import.meta.url);
const ratingsFile = toFileUrl(Deno.makeTempFileSync({ suffix: ".json" }));
const app = createApp({
  recipesDir: fixturesDir,
  resumeFile: resumeFile,
  ratingsFile,
});

Deno.test("GET /health", async () => {
  const { status, body } = await request(app, "/health");
  assertEquals(status, 200);

  const json = JSON.parse(body as string);
  assertEquals(json.status, "OK");
});
