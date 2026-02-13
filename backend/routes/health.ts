import type { Router } from "oak";

export const registerHealthRoutes = (router: Router) => {
  router.get("/health", (ctx) => {
    ctx.response.status = 200;
    ctx.response.body = { status: "OK" };
  });
};
