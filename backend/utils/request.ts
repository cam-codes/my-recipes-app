import type { Context } from "oak";

export const getClientKey = (ctx: Context, slug: string) => {
  const forwarded = ctx.request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || ctx.request.ip || "unknown";
  return `${ip}|${slug}`;
};
