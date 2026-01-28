import { Application, Router, send, Context, RouterContext } from "oak";
import { extractYaml } from "@std/front-matter";
import { RecipeFrontMatter } from "./types.ts"
import { normalizeRecipe } from "./utils/recipe.ts";

export function createApp(recipesDir: URL): Application {
    const app = new Application();
    const router = new Router();


    // app.use(async (ctx, next) => {

    //     await next();
    // });

    // CORS and static images
    app.use(async (ctx, next) => {
        ctx.response.headers.set("Access-Control-Allow-Origin", "http://localhost:5173");
        ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type");

        // Normalize /recipes/ → /recipes to avoid 301 redirects (CORS-safe)
        if (ctx.request.url.pathname === "/recipes/") {
          console.log("normalizing request...");
          console.log("ctx.request.url: ", ctx.request.url);
          ctx.request.url.pathname = "/recipes";
          console.log("request normalized.")
          console.log("ctx.request.url: ", ctx.request.url);
        }

        if (ctx.request.method === "OPTIONS") {
            ctx.response.status = 204;
            return;
        }

        const pathname = ctx.request.url.pathname;

        // expose recipes directory so images can be loaded on the frontend
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
                        root: recipesDir.pathname
                    }
                );
            } catch (err) {
                // deno-coverage-ignore-next-line
                console.error("Failed to serve static file:", err instanceof Error ? err.message : String(err));
                ctx.response.status = 404;
                ctx.response.body = { error: "Not Found" };
            }
            return;
        }

        await next();
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
        const recipeFile = new URL(`${slug}/recipe.md`, recipesDir);

        try {
            const content = await Deno.readTextFile(recipeFile.pathname);
            const { attrs= {} } = extractYaml<RecipeFrontMatter>(content);

            // normalize data and add to response body
            ctx.response.body = normalizeRecipe(slug, attrs);
        } catch (err) {
            // deno-coverage-ignore-next-line
            console.error(`"/recipes/:slug" :: [SKIPPED] ${slug}:`, err instanceof Error ? err.message : String(err));
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal Server Error" };
        }
    });

    // GET /recipes - List all recipes
    router.get("/recipes", async (ctx: Context) => {
        const list = [];

        for await (const entry of Deno.readDir(recipesDir)) {
            if (!entry.isDirectory) continue;

            const slug = entry.name;
            const recipeFile = new URL(`${slug}/recipe.md`, recipesDir);

            try {
                const content = await Deno.readTextFile(recipeFile.pathname);
                const { attrs } = extractYaml<RecipeFrontMatter>(content);

                // normalize data and push
                list.push(normalizeRecipe(entry.name, attrs));
            } catch (err) {
                // deno-coverage-ignore-next-line
                console.error(`recipes :: [SKIPPED] ${slug}:`, err instanceof Error ? err.message : String(err));
            }

        }
        ctx.response.body = list;
    });

    app.use(router.routes());
    app.use(router.allowedMethods());
    return app;
}
