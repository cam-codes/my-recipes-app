import { createApp } from "./main.ts";

if (import.meta.main) {
    // Use RECIPES_DIRECTORY env var in Docker; fallback for local dev
    const recipesPath = Deno.env.get("RECIPES_DIRECTORY") ?? "../recipes";
    const RECIPES_DIR = new URL(recipesPath, import.meta.url);

    // Use BACKEND_PORT env var in Docker; fallback for local dev
    const PORT = Number(Deno.env.get("BACKEND_PORT") ?? 3000);

    const app = createApp(RECIPES_DIR);
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    await app.listen({
        port: PORT,
        hostname: "0.0.0.0",
    });
}
