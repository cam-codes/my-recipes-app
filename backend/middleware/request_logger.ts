import type { Middleware } from "oak";

export const requestLogger = (): Middleware => {
  return async (ctx, next) => {
    const start = performance.now();
    await next();
    const durationMs = Math.round(performance.now() - start);
    const status = ctx.response.status || 200;
    const method = ctx.request.method;
    const path = ctx.request.url.pathname;
    console.log(`${method} ${path} ${status} ${durationMs}ms`);
  };
};
