import { assert, assertEquals } from "@std/assert";
import { createApp } from "../main.ts";
import { request } from "./fixtures/utils/utils.ts";
import { normalizeRecipe } from "../utils/recipe.ts";
import { fromFileUrl, toFileUrl } from "std/path/mod.ts";

const fixturesDir = new URL("./fixtures/recipes/", import.meta.url);
const resumeFile = new URL("./fixtures/resume/resume.md", import.meta.url);
const buildApp = (ratingsFile?: URL, recipesDir: URL = fixturesDir) =>
  createApp({
    recipesDir,
    resumeFile: resumeFile,
    ratingsFile,
  });

const createRatingsFile = () =>
  toFileUrl(Deno.makeTempFileSync({ suffix: ".json" }));
const createTempRecipesDir = () => toFileUrl(Deno.makeTempDirSync());

Deno.test("GET /recipes returns list of recipes", async () => {
  const app = buildApp(createRatingsFile());
  const { status, body } = await request(app, "/recipes");
  assertEquals(status, 200);
  const json = JSON.parse(body as string);
  assertEquals(Array.isArray(json), true);
});

Deno.test("GET /recipes/:slug returns recipe details", async () => {
  const app = buildApp(createRatingsFile());
  const { status, body } = await request(app, "/recipes/valid-recipe");
  assertEquals(status, 200);
  const json = JSON.parse(body as string);
  assertEquals(json.title, "Valid Recipe");
});

Deno.test("GET /recipes/:slug returns 404 for missing recipe", async () => {
  const app = buildApp(createRatingsFile());
  const { status, body } = await request(app, "/recipes/non-existent");
  assertEquals(status, 404);
  assertEquals(body, "Recipe not found");
});

Deno.test("GET /recipes/:slug returns 500 for unreadable recipe file", async () => {
  const tempRecipesDir = createTempRecipesDir();
  const basePath = fromFileUrl(tempRecipesDir);
  const slugDir = `${basePath}/bad-recipe`;
  Deno.mkdirSync(slugDir, { recursive: true });
  Deno.mkdirSync(`${slugDir}/recipe.md`);

  const app = buildApp(createRatingsFile(), tempRecipesDir);
  const { status, body } = await request(app, "/recipes/bad-recipe");
  assertEquals(status, 500);
  assertEquals(body, "Internal Server Error");
});

Deno.test("serves recipe image", async () => {
  const app = buildApp(createRatingsFile());
  const { status } = await request(app, "/recipes/valid-recipe/image.jpg");
  assertEquals(status, 200);
});

Deno.test("missing image returns 404", async () => {
  const app = buildApp(createRatingsFile());
  const { status, body } = await request(app, "/recipes/nope/image.jpg");
  assertEquals(status, 404);
  assertEquals(body, "Image not found");
});

Deno.test("non-directory entries are skipped", async () => {
  const app = buildApp(createRatingsFile());
  const resp = await app.handle(
    new Request("http://localhost/recipes"),
  );

  assert(resp);
  const list = await resp.json();

  assert(Array.isArray(list));
});

Deno.test("invalid recipe is skipped", async () => {
  const app = buildApp(createRatingsFile());
  const resp = await app.handle(
    new Request("http://localhost/recipes"),
  );

  assert(resp);
  const list = await resp.json();

  assert(!list.some((r: { slug: string }) => r.slug === "broken-recipe"));
});

Deno.test("normalizeRecipe fills in defaults", () => {
  const slug = "empty-fields-recipe";
  const input = {};

  const recipe = normalizeRecipe(slug, input);

  assertEquals(recipe.title, "Empty Fields Recipe");
  assertEquals(recipe.description, "");
  assertEquals(recipe.prepTime, 0);
  assertEquals(recipe.cookTime, 0);
  assertEquals(recipe.estimatedCost, 0);
  assertEquals(recipe.ingredients, []);
  assertEquals(recipe.instructions, []);
  assertEquals(recipe.tips, []);
  assertEquals(recipe.image, "/recipes/empty-fields-recipe/image.jpg");
});

Deno.test("POST /recipes/:slug/ratings stores rating and returns average", async () => {
  const ratingsFile = createRatingsFile();
  const app = buildApp(ratingsFile);
  const { status, body } = await request(
    app,
    "/recipes/minimal-recipe/ratings",
    {
      method: "POST",
      headers: { "x-forwarded-for": "10.0.0.1" },
      body: { rating: 5 },
    },
  );

  assertEquals(status, 200);
  const json = JSON.parse(body as string);
  assertEquals(json.ratingAverage, 5);
  assertEquals(json.ratingCount, 1);

  const recipeResp = await request(app, "/recipes/minimal-recipe");
  const recipe = JSON.parse(recipeResp.body as string);
  assertEquals(recipe.ratingAverage, 5);
  assertEquals(recipe.ratingCount, 1);

  const appReloaded = buildApp(ratingsFile);
  const recipeReloadedResp = await request(
    appReloaded,
    "/recipes/minimal-recipe",
  );
  const recipeReloaded = JSON.parse(recipeReloadedResp.body as string);
  assertEquals(recipeReloaded.ratingAverage, 5);
  assertEquals(recipeReloaded.ratingCount, 1);
});

Deno.test("POST /recipes/:slug/ratings rate-limits rapid re-rates", async () => {
  const app = buildApp(createRatingsFile());
  const headers = { "x-forwarded-for": "10.0.0.2" };

  await request(app, "/recipes/valid-recipe/ratings", {
    method: "POST",
    headers,
    body: { rating: 4 },
  });

  const { status, body } = await request(app, "/recipes/valid-recipe/ratings", {
    method: "POST",
    headers,
    body: { rating: 5 },
  });

  assertEquals(status, 429);
  const json = JSON.parse(body as string);
  assertEquals(typeof json.retryAfterMs, "number");
});

Deno.test("POST /recipes/:slug/ratings returns 404 for missing recipe", async () => {
  const app = buildApp(createRatingsFile());
  const { status, body } = await request(app, "/recipes/nope/ratings", {
    method: "POST",
    body: { rating: 4 },
  });
  assertEquals(status, 404);
  assertEquals(body, "Recipe not found");
});

Deno.test("POST /recipes/:slug/ratings rejects invalid rating values", async () => {
  const app = buildApp(createRatingsFile());
  const { status, body } = await request(app, "/recipes/valid-recipe/ratings", {
    method: "POST",
    body: { rating: 0 },
  });
  assertEquals(status, 400);
  assertEquals(body, "Invalid rating");
});

Deno.test("POST /recipes/:slug/ratings rejects non-json body", async () => {
  const app = buildApp(createRatingsFile());
  const { status, body } = await request(app, "/recipes/valid-recipe/ratings", {
    method: "POST",
    body: "not json",
  });
  assertEquals(status, 400);
  assertEquals(body, "Invalid rating");
});

Deno.test("invalid rating averages reset to zero", async () => {
  const ratingsFile = createRatingsFile();
  const filePath = fromFileUrl(ratingsFile);
  Deno.writeTextFileSync(
    filePath,
    JSON.stringify({
      "valid-recipe": { total: 99, count: 1 },
    }),
  );

  const app = buildApp(ratingsFile);
  const { status, body } = await request(app, "/recipes/valid-recipe");
  assertEquals(status, 200);

  const json = JSON.parse(body as string);
  assertEquals(json.ratingAverage, 0);
  assertEquals(json.ratingCount, 0);

  const persisted = JSON.parse(Deno.readTextFileSync(filePath));
  assertEquals(persisted["valid-recipe"].total, 0);
  assertEquals(persisted["valid-recipe"].count, 0);
});
