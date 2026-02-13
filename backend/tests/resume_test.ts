import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertExists,
} from "@std/assert";
import { createApp } from "../main.ts";
import { request } from "./fixtures/utils/utils.ts";
import { vi } from "vitest";
import { toFileUrl } from "std/path/mod.ts";

const fixturesDir = new URL("./fixtures/recipes/", import.meta.url);
const resumeFile = new URL("./fixtures/resume/resume.md", import.meta.url);
const ratingsFile = toFileUrl(Deno.makeTempFileSync({ suffix: ".json" }));
const app = createApp({
  recipesDir: fixturesDir,
  resumeFile: resumeFile,
  ratingsFile,
});

Deno.test("GET /resume returns resume data", async () => {
  const { status, body } = await request(app, "/resume");

  assertEquals(status, 200);

  const json = JSON.parse(body as string);

  // ---- Top-level shape ----
  assertEquals(typeof json.name, "string");
  assertEquals(typeof json.email, "string");
  assertEquals(typeof json.phone, "string");
  assertEquals(typeof json.linkedin, "string");
  assertEquals(typeof json.summary, "string");

  // ---- Sentinel values (stable, intentional) ----
  assertEquals(json.name, "Cameron Fournier");
  assert(json.email.includes("@"));
  assert(json.linkedin.startsWith("https://"));

  // ---- Skills ----
  assertExists(json.skills);
  assertEquals(typeof json.skills, "object");
  assertArrayIncludes(
    json.skills["Programming Languages"],
    ["Go", "TypeScript"],
  );

  // ---- Experience ----
  assert(Array.isArray(json.experience));
  assert(json.experience.length > 0);

  const firstJob = json.experience[0];
  assertEquals(typeof firstJob.role, "string");
  assert(Array.isArray(firstJob.bullets));
  assert(firstJob.bullets.length > 0);

  // ---- Education ----
  assert(Array.isArray(json.education));
  assert(json.education.length > 0);
  assertEquals(typeof json.education[0].degree, "string");

  // ---- Volunteering ----
  assert(Array.isArray(json.volunteering));
});

Deno.test("GET /resume returns 404 when resume file is missing", async () => {
  const readSpy = vi.spyOn(Deno, "readTextFile");
  readSpy.mockRejectedValue(new Deno.errors.NotFound("nope"));
  const { status, body } = await request(app, "/resume");
  assertEquals(status, 404);
  assertEquals(body, "Internal Server Error");
});

Deno.test("GET /resume returns 500 for unexpected errors", async () => {
  const readSpy = vi.spyOn(Deno, "readTextFile");
  readSpy.mockRejectedValue(new Error("nope"));
  const { status, body } = await request(app, "/resume");
  assertEquals(status, 500);
  assertEquals(body, "Internal Server Error");
});

Deno.test("GET /resume handles non-error throws", async () => {
  const readSpy = vi.spyOn(Deno, "readTextFile");
  readSpy.mockRejectedValue("nope");
  const { status, body } = await request(app, "/resume");
  assertEquals(status, 500);
  assertEquals(body, "Internal Server Error");
});
