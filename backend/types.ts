import type {RecipeListItem} from "../frontend/src/lib/types.ts";

export interface RecipeFrontMatter {
  title?: string;

  // meta
  description?: string;
  image?: string;

  // timing/cost
  prepTime?: number | string; // allow string since YAML can parse as string
  cookTime?: number | string;
  estimatedCost?: number | string;

  // content
  ingredients?: string[];
  instructions?: string[];
  tips?: string[];

  // allow for future expansion
  [key: string]: unknown;
}

export interface Recipe {
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
