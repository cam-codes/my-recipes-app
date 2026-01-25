import { createApp } from "./main.ts";

if (import.meta.main) {
    const RECIPES_DIR = new URL("../recipes/", import.meta.url);
    const app = createApp(RECIPES_DIR);

    const port = 8000;
    console.log(`🚀 Server running at http://localhost:${port}`);
    await app.listen({ port });
}
