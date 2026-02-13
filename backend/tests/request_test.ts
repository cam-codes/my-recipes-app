import { assertEquals } from "@std/assert";
import type { Context } from "oak";
import { getClientKey } from "../utils/request.ts";

const buildContext = (headers: HeadersInit, ip?: string) =>
  ({
    request: {
      headers: new Headers(headers),
      ip,
    },
  }) as unknown as Context;

Deno.test("getClientKey uses x-forwarded-for when present", () => {
  const ctx = buildContext({ "x-forwarded-for": "10.0.0.1, 10.0.0.2" }, "9.9.9.9");
  const key = getClientKey(ctx, "recipe");
  assertEquals(key, "10.0.0.1|recipe");
});

Deno.test("getClientKey falls back to request.ip when header is empty", () => {
  const ctx = buildContext({ "x-forwarded-for": "   " }, "9.9.9.9");
  const key = getClientKey(ctx, "recipe");
  assertEquals(key, "9.9.9.9|recipe");
});

Deno.test("getClientKey uses unknown when no ip is available", () => {
  const ctx = buildContext({});
  const key = getClientKey(ctx, "recipe");
  assertEquals(key, "unknown|recipe");
});
