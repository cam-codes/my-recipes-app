import { Context, Router, RouterContext } from "oak";
import { extractYaml } from "@std/front-matter";
import type { RecipeFrontMatter } from "../types.ts";
import { normalizeRecipe } from "../utils/recipe.ts";
import { RatingsStore } from "../services/ratings.ts";
import { RateLimiter } from "../services/rate_limiter.ts";
import { getClientKey } from "../utils/request.ts";

type RecipeRouteOptions = {
  recipesDir: URL;
  ratingsStore: RatingsStore;
  rateLimiter: RateLimiter;
};

export const registerRecipeRoutes = (
  router: Router,
  options: RecipeRouteOptions,
) => {
  const { recipesDir, ratingsStore, rateLimiter } = options;

  /**
   * note: route order matters. if recipes came before /recipes/:slug, and the frontend requests
   * /recipes/chicken-caesar-salad, Oak tries to match /recipes first, doesn’t find a file named literally
   * chicken-caesar-salad in that route, and may never hit the /:slug route in some configurations.
   */
  // GET /recipes/:slug - Single recipe details
  router.get(
    "/recipes/:slug",
    async (
      ctx: RouterContext<"/recipes/:slug">,
    ) => {
      const slug = ctx.params.slug!;
      const recipeFilePath = `${recipesDir.pathname}/${slug}/recipe.md`;

      try {
        const content = await Deno.readTextFile(recipeFilePath);
        const { attrs = {} } = extractYaml<RecipeFrontMatter>(content);

        // normalize data and add to response body
        ctx.response.body = {
          ...normalizeRecipe(slug, attrs),
          ...ratingsStore.getSummary(slug),
        };
        await ratingsStore.persistIfDirty();
      } catch (err) {
        console.error(`Failed to load recipe: ${slug} -- `, err);
        ctx.throw(
          err instanceof Deno.errors.NotFound ? 404 : 500,
          err instanceof Deno.errors.NotFound
            ? "Recipe not found"
            : "Internal Server Error",
        );
      }
    },
  );

  // GET /recipes - List all recipes
  router.get("/recipes", async (ctx: Context) => {
    const list = [];

    for await (const entry of Deno.readDir(recipesDir)) {
      if (!entry.isDirectory) continue;

      const slug = entry.name;
      const recipeFilePath = `${recipesDir.pathname}/${slug}/recipe.md`;

      try {
        const content = await Deno.readTextFile(recipeFilePath);
        const { attrs } = extractYaml<RecipeFrontMatter>(content);

        // normalize data and push
        list.push({
          ...normalizeRecipe(entry.name, attrs),
          ...ratingsStore.getSummary(entry.name),
        });
      } catch (err) {
        console.error(`Skipped invalid recipe: ${slug} --`, err);
      }
    }
    await ratingsStore.persistIfDirty();
    ctx.response.body = list;
  });

  // POST /recipes/:slug/ratings - Submit rating for a recipe (1-5)
  router.post(
    "/recipes/:slug/ratings",
    async (
      ctx: RouterContext<"/recipes/:slug/ratings">,
    ) => {
      const slug = ctx.params.slug!;
      const recipeFilePath = `${recipesDir.pathname}/${slug}/recipe.md`;

      try {
        await Deno.stat(recipeFilePath);
      } catch (err) {
        console.error(`Failed to load recipe: ${slug} -- `, err);
        ctx.throw(
          err instanceof Deno.errors.NotFound ? 404 : 500,
          err instanceof Deno.errors.NotFound
            ? "Recipe not found"
            : "Internal Server Error",
        );
      }

      const clientKey = getClientKey(ctx, slug);
      const now = Date.now();
      const retryAfterMs = rateLimiter.getRetryAfterMs(clientKey, now);

      if (retryAfterMs !== null) {
        ctx.response.status = 429;
        ctx.response.body = {
          error: "Rate limit exceeded",
          retryAfterMs,
        };
        return;
      }

      let rating: unknown;
      try {
        const body = ctx.request.body({ type: "json" });
        const value = await body.value;
        rating = value?.rating;
      } catch {
        ctx.throw(400, "Invalid rating");
      }

      if (
        typeof rating !== "number" ||
        !Number.isFinite(rating) ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        ctx.throw(400, "Invalid rating");
      }

      rateLimiter.record(clientKey, now);
      const summary = ratingsStore.record(slug, rating);
      await ratingsStore.persist();
      ctx.response.body = summary;
    },
  );
};
