export interface RecipeListItem {
  slug: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  image: string;
}

export interface Recipe extends RecipeListItem {
  estimatedCost: number;
  ingredients: string[];
  instructions: string[];
  tips: string[];
}
