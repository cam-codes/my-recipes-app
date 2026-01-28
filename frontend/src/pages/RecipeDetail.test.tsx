import { render, screen, waitFor } from "@solidjs/testing-library";
import RecipeDetail from "./RecipeDetail";

// mock the api module
import * as api from "../lib/api";
import type {Recipe} from "../lib/types.ts";

vi.mock("../lib/api");

// mock the router before importing the component
vi.mock("@solidjs/router", () => ({
    useParams: () => ({ slug: "miso-salmon" }),
    A: (props: any) => <a {...props} />,
}));

const mockRecipe: Recipe = {
    slug: "miso-salmon",
    title: "Miso Salmon",
    description: "Description",
    image: "/img.jpg",
    estimatedCost: 25,
    prepTime: 15,
    cookTime: 20,
    ingredients: ["Salmon", "Miso paste"],
    instructions: ["Mix", "Bake"],
    tips: ["Serve hot"],
};

it("renders recipe detail page", async () => {
    (api.getRecipe as vi.Mock).mockResolvedValue(mockRecipe);
    render(() => <RecipeDetail />);

    await waitFor(async () => {
        expect(screen.getByText("Miso Salmon")).toBeInTheDocument();
        expect(screen.getByText("Bake")).toBeInTheDocument();
    });
});