import { Application, Context, Router, RouterContext, send } from "oak";
import { extractYaml } from "@std/front-matter";
import {
  CreateAppOptions,
  RecipeFrontMatter,
  ResumeFrontMatter,
} from "./types.ts";
import { normalizeRecipe } from "./utils/recipe.ts";

export const COMPARE_URL =
  "https://github.com/cam-codes/my-recipes-app/compare";

export function createApp(options: CreateAppOptions): Application {
  const { recipesDir, resumeFile } = options;
  const app = new Application();
  const router = new Router();

  // CORS and static images
  app.use(async (ctx, next) => {
    const pathname = ctx.request.url.pathname;

    // serve static files ONLY if there's a file extension
    // e.g. /recipes/foo/image.jpg
    if (
      pathname.startsWith("/recipes/") &&
      pathname.endsWith(".jpg")
    ) {
      try {
        // remove leading "/recipes" from URL to map to filesystem
        await send(
          ctx,
          ctx.request.url.pathname.replace(/^\/recipes/, ""),
          {
            root: recipesDir.pathname,
          },
        );
      } catch (err) {
        console.error("Failed to serve static file:", err);
        ctx.throw(404, "Image not found");
      }
      return;
    }

    await next();
  });

  router.get("/health", (ctx) => {
    ctx.response.status = 200;
    ctx.response.body = { status: "OK" };
  });

  /**
   * note: route order matters. if recipes came before /recipes/:slug, and the frontend requests
   * /recipes/chicken-caesar-salad, Oak tries to match /recipes first, doesn’t find a file named literally
   * chicken-caesar-salad in that route, and may never hit the /:slug route in some configurations.
   */
  // GET /recipes/:slug - Single recipe details
  router.get(
    "/recipes/:slug",
    async (ctx: RouterContext<"/recipes/:slug"> // ctx.params does exist at runtime, but TypeScript doesn’t know it unless the route context is typed as a RouterContext
    ) => {
      const slug = ctx.params.slug!;
      const recipeFilePath = `${recipesDir.pathname}/${slug}/recipe.md`;

      try {
        const content = await Deno.readTextFile(recipeFilePath);
        const { attrs = {} } = extractYaml<RecipeFrontMatter>(content);

        // normalize data and add to response body
        ctx.response.body = normalizeRecipe(slug, attrs);
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
        list.push(normalizeRecipe(entry.name, attrs));
      } catch (err) {
        console.error(`Skipped invalid recipe: ${slug} --`, err);
      }
    }
    ctx.response.body = list;
  });

  // /resume → returns parsed frontmatter as JSON
  router.get("/resume", async (ctx) => {
    try {
      const content = await Deno.readTextFile(resumeFile);
      const { attrs } = extractYaml<ResumeFrontMatter>(content);
      ctx.response.body = attrs;
    } catch (err) {
      console.error(
        "could not read resume file:",
        err instanceof Error ? err.message : String(err),
      );
      ctx.throw(
        err instanceof Deno.errors.NotFound ? 404 : 500,
        "Internal Server Error",
      );
    }
  });

  router.get("/build-info", (ctx) => {
    const gitCommit = Deno.env.get("GIT_COMMIT") || "HEAD";
    const gitTag = Deno.env.get("GIT_TAG") || "";
    const latestTag = Deno.env.get("LATEST_TAG") || "v1.0.0";

    ctx.response.body = {
      gitCommit: gitCommit,
      compareUrl: `${COMPARE_URL}/${latestTag}...${gitCommit}`,
      gitTag: gitTag,
    };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}
