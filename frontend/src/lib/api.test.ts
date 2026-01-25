import { describe, it, expect, vi } from "vitest";
import { getRecipes, getRecipe } from "./api";
import { mockRecipes, mockRecipe } from "../test/mocks/api";

globalThis.fetch = vi.fn(async (input: RequestInfo) => {
    const url = input.toString();

    if (url.endsWith("/recipes")) {
        return new Response(JSON.stringify(mockRecipes), { status: 200 });
    }

    if (url.endsWith("/recipes/miso-salmon")) {
        return new Response(JSON.stringify(mockRecipe), { status: 200 });
    }

    return new Response(null, { status: 404 });
}) as unknown as typeof fetch;

describe("api", () => {
    it("fetches recipe list", async () => {
        const recipes = await getRecipes();
        expect(recipes).toHaveLength(1);
    });

    it("fetches recipe by slug", async () => {
        const recipe = await getRecipe("miso-salmon");
        expect(recipe.slug).toBe("miso-salmon");
    });

    it("throws 'Failed to fetch recipes' on non-404 error", async () => {
        globalThis.fetch = vi.fn().mockResolvedValue(
            new Response(null, { status: 500 })
        ) as any;

        expect(getRecipes()).rejects.toThrow(
            "Failed to fetch recipe"
        );
    });

    it("throws 'Recipe not found' on 404", async () => {
        globalThis.fetch = vi.fn().mockResolvedValue(
            new Response(null, { status: 404 })
        ) as any;

        expect(getRecipe("does-not-exist")).rejects.toThrow(
            "Recipe not found"
        );
    });

    it("throws 'Failed to fetch recipe' on non-404 error", async () => {
        globalThis.fetch = vi.fn().mockResolvedValue(
            new Response(null, { status: 500 })
        ) as any;

        expect(getRecipe("miso-salmon")).rejects.toThrow(
            "Failed to fetch recipe"
        );
    });
});
