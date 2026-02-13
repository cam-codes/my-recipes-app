import type { Category } from './ingredientCategories';

export interface RecipeListItem {
  slug: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  image: string;
  ratingAverage: number;
  ratingCount: number;
  collection: 'savory' | 'sweet';
}

export type IngredientEntry = string | Record<string, string>;

export interface Recipe extends RecipeListItem {
  slug: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  estimatedCost: number;
  ingredients: IngredientEntry[];
  instructions: string[];
  tips: string[];
  image: string;
  ratingAverage: number;
  ratingCount: number;
}

export type GroupedIngredient = {
  key: string;
  display: string;
  recipes: string[];
};

export type ParsedIngredient = {
  key: string;
  nameKey: string;
  displayName: string;
  categoryName: string;
  unit: string | null;
  quantityMin: number | null;
  quantityMax: number | null;
  hasQuantity: boolean;
};

export type AggregatedIngredient = {
  key: string;
  nameKey: string;
  displayName: string;
  unit: string | null;
  quantityMin: number | null;
  quantityMax: number | null;
  recipes: string[];
  category: Category;
};

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  skills: Record<string, string[]>;
  experience: Array<{
    role: string;
    company: string;
    location: string;
    dates: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    dates: string;
    details: Array<string | Record<string, string>>;
  }>;
  volunteering: string[];
}
