import type { Recipe, RecipeListItem } from './types';

export async function getRecipes(): Promise<RecipeListItem[]> {
  const res = await fetch('/api/recipes');
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
}

export async function getRecipe(slug: string): Promise<Recipe> {
  const res = await fetch(`/api/recipes/${slug}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Recipe not found');
    throw new Error('Failed to fetch recipe');
  }
  return res.json();
}

export async function getResume(): Promise<ResumeData> {
  const res = await fetch('/api/resume');
  if (!res.ok) throw new Error('Failed to fetch resume');
  return res.json();
}

export async function getBuildInfo(): Promise<{
  commit: string;
  version: string;
  buildDate: string;
}> {
  const res = await fetch("/api/build-info");
  if (!res.ok) throw new Error("Failed to load build info");
  return res.json();
}
