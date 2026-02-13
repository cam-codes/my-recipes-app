import { Context, send } from "oak";

export const createStaticImagesMiddleware =
  (recipesDir: URL) => async (ctx: Context, next: () => Promise<unknown>) => {
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
  };
