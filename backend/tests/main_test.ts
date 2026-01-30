import { assert, assertEquals } from "std/testing/asserts.ts";
import { createApp } from "../main.ts";
import { normalizeRecipe } from "../utils/recipe.ts";

const fixturesDir = new URL("./fixtures/recipes/", import.meta.url);
const app = createApp(fixturesDir);

// Utility to perform HTTP-like requests
async function request(url: string, method = "GET") {
  const req = new Request(`http://localhost${url}`, { method });
  const resp = await app.handle(req);
  const body = await resp?.text();
  return { status: resp?.status, body };
}

Deno.test("GET /health", async () => {
  const { status, body } = await request("/health");
  assertEquals(status, 200);

  const json = JSON.parse(body as string);
  assertEquals(json.status, "OK");
})

Deno.test("OPTIONS request returns 204", async () => {
  const { status } = await request("/recipes", "OPTIONS");
  assertEquals(status, 204);
});

Deno.test("GET /recipes returns list of recipes", async () => {
  const { status, body } = await request("/recipes");
  assertEquals(status, 200);
  const json = JSON.parse(body as string);
  assertEquals(Array.isArray(json), true);
});

Deno.test("GET /recipes/:slug returns recipe details", async () => {
  const { status, body } = await request("/recipes/valid-recipe");
  assertEquals(status, 200);
  const json = JSON.parse(body as string);
  assertEquals(json.title, "Valid Recipe");
});

Deno.test("GET /recipes/:slug returns 500 for missing recipe", async () => {
  const { status, body } = await request("/recipes/non-existent");
  assertEquals(status, 500);
  assertEquals(body, "Internal Server Error");
});

Deno.test("serves recipe image", async () => {
  const { status } = await request("/recipes/valid-recipe/image.jpg");
  assertEquals(status, 200);
});

Deno.test("missing image returns 404", async () => {
  const { status, body } = await request("/recipes/nope/image.jpg");
  assertEquals(status, 404);
  assertEquals(body, "Not Found");
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
