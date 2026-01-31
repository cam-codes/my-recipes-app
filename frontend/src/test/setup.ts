import '@testing-library/jest-dom';

import type { Recipe } from '../components/Recipe.tsx';

export default function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    slug: 'test-slug',
    title: 'Test Title',
    description: 'Test Description',
    prepTime: 1,
    cookTime: 1,
    estimatedCost: 1,
    ingredients: ['flour', 'milk'],
    instructions: ['shake', 'bake'],
    tips: ['Initialize me'],
    image: './image.jpg',
    ...overrides,
  };
}
