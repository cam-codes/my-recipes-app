import { assert,
  assertEquals
} from "@std/assert";
import { createApp } from "../main.ts";
import { request } from "./fixtures/utils/utils.ts";
import { normalizeRecipe } from "../utils/recipe.ts";

const fixturesDir = new URL("./fixtures/recipes/", import.meta.url);
const resumeFile = new URL("./fixtures/resume/resume.md", import.meta.url);
const app = createApp({
  recipesDir: fixturesDir,
  resumeFile: resumeFile
});

Deno.test("GET /recipes returns list of recipes", async () => {
  const { status, body } = await request(app, "/recipes");
  assertEquals(status, 200);
  const json = JSON.parse(body as string);
  assertEquals(Array.isArray(json), true);
});

Deno.test("GET /recipes/:slug returns recipe details", async () => {
  const { status, body } = await request(app, "/recipes/valid-recipe");
  assertEquals(status, 200);
  const json = JSON.parse(body as string);
  assertEquals(json.title, "Valid Recipe");
});

Deno.test("GET /recipes/:slug returns 404 for missing recipe", async () => {
  const { status, body } = await request(app, "/recipes/non-existent");
  assertEquals(status, 404);
  assertEquals(body, "Recipe not found");
});

Deno.test("serves recipe image", async () => {
  const { status } = await request(app, "/recipes/valid-recipe/image.jpg");
  assertEquals(status, 200);
});

Deno.test("missing image returns 404", async () => {
  const { status, body } = await request(app, "/recipes/nope/image.jpg");
  assertEquals(status, 404);
  assertEquals(body, "Image not found");
});

Deno.test("non-directory entries are skipped", async () => {
  const resp = await app.handle(
    new Request("http://localhost/recipes"),
  );

  assert(resp);
  const list = await resp.json();

  assert(Array.isArray(list));
});

Deno.test("invalid recipe is skipped", async () => {
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
