import type { IngredientEntry } from './types';

export type IngredientSection = {
  title?: string;
  items: string[];
};

const isString = (value: unknown): value is string => typeof value === 'string';

export const flattenIngredients = (ingredients: IngredientEntry[]): string[] => {
  const items: string[] = [];

  for (const entry of ingredients) {
    if (isString(entry)) {
      items.push(entry);
      continue;
    }

    if (!entry || typeof entry !== 'object') continue;

    for (const value of Object.values(entry)) {
      if (isString(value)) {
        items.push(value);
      }
    }
  }

  return items;
};

export const buildIngredientSections = (ingredients: IngredientEntry[]): IngredientSection[] => {
  const sections: IngredientSection[] = [];
  let current: IngredientSection | null = null;

  const flush = () => {
    if (current && current.items.length > 0) {
      sections.push(current);
    }
  };

  const ensureSection = (title?: string) => {
    if (!current || current.title !== title) {
      flush();
      current = { title, items: [] };
    }
  };

  for (const entry of ingredients) {
    if (isString(entry)) {
      if (!current) {
        current = { title: undefined, items: [] };
      }
      current.items.push(entry);
      continue;
    }

    if (!entry || typeof entry !== 'object') continue;

    for (const [title, value] of Object.entries(entry)) {
      if (!isString(value)) continue;
      ensureSection(title);
      current!.items.push(value);
    }
  }

  flush();
  return sections;
};
