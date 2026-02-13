import type { RecipeListItem } from './types';

export type CollectionKey = 'savory' | 'sweet';
export type SortMode = 'alpha' | 'rating';

export type CollectionMeta = {
  title: string;
  description: string;
  accent: string;
  glow: string;
};

export const COLLECTIONS: Record<CollectionKey, CollectionMeta> = {
  savory: {
    title: 'Savory',
    description: 'Entrees, hearty pastas, and weeknight favorites.',
    accent:
      'from-amber-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900',
    glow: 'bg-amber-400/20 dark:bg-amber-300/10',
  },
  sweet: {
    title: 'Sweet',
    description: 'Desserts and cozy treats with a little extra sparkle.',
    accent:
      'from-rose-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900',
    glow: 'bg-rose-400/20 dark:bg-rose-300/10',
  },
};

export const COLLECTION_KEYS: CollectionKey[] = ['savory', 'sweet'];

export const PREVIEW_TRANSFORMS = [
  { rotate: -7, x: -22, y: 16, scale: 0.92 },
  { rotate: -3, x: -10, y: 6, scale: 0.96 },
  { rotate: 0, x: 0, y: 0, scale: 1 },
  { rotate: 3, x: 12, y: -6, scale: 1.03 },
  { rotate: 7, x: 24, y: -14, scale: 1.06 },
];

export const sortRecipes = (items: RecipeListItem[], mode: SortMode) => {
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (mode === 'rating') {
      const delta = b.ratingAverage - a.ratingAverage;
      if (delta !== 0) return delta;
    }
    return a.title.localeCompare(b.title);
  });
  return sorted;
};

export const buildCollections = (
  items: RecipeListItem[],
  sortModes: Record<CollectionKey, SortMode>,
): Record<CollectionKey, RecipeListItem[]> => {
  const grouped: Record<CollectionKey, RecipeListItem[]> = {
    savory: [],
    sweet: [],
  };

  for (const recipe of items) {
    const collection: CollectionKey = recipe.collection === 'sweet' ? 'sweet' : 'savory';
    grouped[collection].push(recipe);
  }

  (Object.keys(grouped) as CollectionKey[]).forEach((key) => {
    grouped[key] = sortRecipes(grouped[key], sortModes[key]);
  });

  return grouped;
};
