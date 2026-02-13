import type { Recipe, RecipeListItem, ResumeData } from './types';

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
  gitCommit: string;
  gitTag: string;
  compareUrl: string;
}> {
  const res = await fetch('/api/build-info');
  if (!res.ok) throw new Error('Failed to load build info');
  return res.json();
}

export class RateLimitError extends Error {
  retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super('Rate limit exceeded');
    this.retryAfterMs = retryAfterMs;
  }
}

export async function rateRecipe(
  slug: string,
  rating: number,
): Promise<{ ratingAverage: number; ratingCount: number }> {
  const res = await fetch(`/api/recipes/${slug}/ratings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rating }),
  });

  if (res.status === 429) {
    const data = await res.json().catch(() => ({ retryAfterMs: 0 }));
    throw new RateLimitError(Number(data.retryAfterMs) || 0);
  }

  if (!res.ok) throw new Error('Failed to submit rating');
  return res.json();
}
