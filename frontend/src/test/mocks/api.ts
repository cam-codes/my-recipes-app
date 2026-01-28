import type { Recipe, RecipeListItem } from "../../lib/types";

export const mockRecipes: RecipeListItem[] = [
    {
        slug: "miso-salmon",
        title: "Miso Salmon",
        image: "/recipes/miso-salmon/image.jpg",
        description: "Savory and fast",
        prepTime: 10,
        cookTime: 15,
    },
];

export const mockRecipe: Recipe = {
    slug: "miso-salmon",
    title: "Miso Salmon",
    description: "Delicious umami salmon",
    image: "/recipes/miso-salmon/image.jpg",
    prepTime: 10,
    cookTime: 15,
    estimatedCost: 12,
    ingredients: ["Salmon", "Miso"],
    instructions: ["Mix", "Bake"],
    tips: [],
};
