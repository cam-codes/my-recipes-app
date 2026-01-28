import { render, screen, waitFor } from "@solidjs/testing-library";
import Home from "./Home";
import { expect, vi } from "vitest";
import type { Recipe } from "../lib/types.ts";
import makeRecipe from "../test/setup.ts"

// mock the api module
import * as api from "../lib/api";

vi.mock("../lib/api", () => ({
    getRecipes: vi.fn(),
}));

// mock RecipeCard to only focus on Home's rendering (not links)
vi.mock("../components/RecipeCard", () => ({
    default: (props: { recipe: any }) => (
        <div data-testid="recipe-card" class="mock-card">
            <h3>{props.recipe.title}</h3>
            {props.recipe.image && (
                <img src={props.recipe.image} alt={props.recipe.title} />
            )}
        </div>
    ),
}));

const mockRecipes: Recipe[] = [
    makeRecipe({ slug: "miso-salmon", title: "Miso Salmon", image: "/recipes/miso-salmon/salmon.jpg" }),
    makeRecipe({ slug: "osso-bucco", title: "Osso Bucco", image: "/image.jpg" }),
];

it("renders recipe list", async () => {
    (api.getRecipes as vi.Mock).mockResolvedValue( mockRecipes );
    render(() => <Home />)

    // wait for resolution
    await waitFor(
        async () => {
            expect(screen.getByText("Miso Salmon")).toBeInTheDocument();
            expect(screen.getByText("Osso Bucco")).toBeInTheDocument();

            const images = screen.getAllByRole("img");
            expect(images).toHaveLength(2);
            expect(images[0]).toHaveAttribute("src", "/recipes/miso-salmon/salmon.jpg");
        },
    );
});
