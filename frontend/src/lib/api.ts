import type { Recipe, RecipeListItem } from './types';
import { API_BASE } from './config.ts';

export async function getRecipes(): Promise<RecipeListItem[]> {
  const res = await fetch(`${API_BASE}/recipes`);
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
}

export async function getRecipe(slug: string): Promise<Recipe> {
  const res = await fetch(`${API_BASE}/recipes/${slug}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Recipe not found');
    throw new Error('Failed to fetch recipe');
  }
  return res.json();
}
