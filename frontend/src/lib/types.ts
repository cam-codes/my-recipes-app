export interface RecipeListItem {
    slug: string;
    title: string;
    description: string;
    prepTime: number;
    cookTime: number;
    image: string;
}

export interface Recipe extends RecipeListItem{
    slug: string;
    title: string;
    description: string;
    prepTime: number;
    cookTime: number;
    estimatedCost: number;
    ingredients: string[];
    instructions: string[];
    tips: string[];
    image: string;
}
