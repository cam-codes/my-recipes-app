import { Application, Router } from "oak";
import { CreateAppOptions } from "./types.ts";
import { createStaticImagesMiddleware } from "./middleware/static_images.ts";
import { registerHealthRoutes } from "./routes/health.ts";
import { registerRecipeRoutes } from "./routes/recipes.ts";
import { registerResumeRoutes } from "./routes/resume.ts";
import { registerBuildInfoRoutes } from "./routes/build_info.ts";
import { RatingsStore } from "./services/ratings.ts";
import { RateLimiter } from "./services/rate_limiter.ts";
import { requestLogger } from "./middleware/request_logger.ts";

export { COMPARE_URL } from "./constants.ts";

export function createApp(options: CreateAppOptions): Application {
  const { recipesDir, resumeFile, ratingsFile } = options;
  const app = new Application();
  const router = new Router();
  const ratingsStore = new RatingsStore(ratingsFile);
  const rateLimiter = new RateLimiter(30_000);

  app.use(requestLogger());
  app.use(createStaticImagesMiddleware(recipesDir));
  registerHealthRoutes(router);
  registerRecipeRoutes(router, {
    recipesDir,
    ratingsStore,
    rateLimiter,
  });
  registerResumeRoutes(router, { resumeFile });
  registerBuildInfoRoutes(router);

  app.use(router.routes());
  app.use(router.allowedMethods());
  return app;
}
