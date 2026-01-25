export interface RecipeListItem {
    slug: string;
    title: string;
}

export interface Recipe {
    title: string;
    prepTime: number;
    cookTime: number;
    estimatedCost: number;
    ingredients: string[];
    instructions: string[];
    tips: string[];
}