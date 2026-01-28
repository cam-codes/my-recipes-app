import { createApp } from "./main.ts";

if (import.meta.main) {
    // Use RECIPES_DIR env var in Docker; fallback for local dev
    const RECIPES_DIR = Deno.env.get("RECIPES_DIR")
      ? new URL(`file://${Deno.env.get("RECIPES_DIR")}/`)
      : new URL("../recipes/", import.meta.url);
    const app = createApp(RECIPES_DIR);

  // Use BACKEND_PORT env var in Docker; fallback for local dev
    const PORT = Deno.env.get("BACKEND_PORT")
      ? Number(Deno.env.get("BACKEND_PORT"))
      : 3000;
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    await app.listen({ port: PORT, hostname: "0.0.0.0" });
}
