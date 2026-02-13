import { describe, expect, it } from 'vitest';
import type { Recipe } from './types';
import { groupIngredientsByCategory } from './utils';

const buildRecipe = (overrides: Partial<Recipe>): Recipe => ({
  slug: 'test-recipe',
  title: 'Test Recipe',
  description: 'Desc',
  prepTime: 1,
  cookTime: 1,
  estimatedCost: 1,
  ingredients: [],
  instructions: [],
  tips: [],
  image: '/image.jpg',
  ...overrides,
});

describe('groupIngredientsByCategory', () => {
  it('aggregates quantities, merges recipes, and excludes ignored items', () => {
    const recipes: Recipe[] = [
      buildRecipe({
        slug: 'chicken-caesar',
        title: 'Chicken Caesar Salad',
        ingredients: [
          '1 clove garlic',
          '2 cloves garlic, grated',
          '2 medium onions, chopped',
          '1 bay leaf',
          '2 berries',
          '2 tomatoes',
          '2 loaves',
          '2 peaches',
          '2 glass',
          '1 1/2 cups flour',
          '1/2 cup sugar',
          'Salt',
          '1 cup water',
        ],
      }),
      buildRecipe({
        slug: 'pork-tenderloin',
        title: 'Roasted Pork Tenderloin',
        ingredients: ['3 cloves garlic, minced', '2 medium onions', '2 bay leaves'],
      }),
      buildRecipe({
        slug: 'chili',
        title: 'Chili Con Carne',
        ingredients: ['5-6 cloves garlic, minced', '2 medium onions, finely diced', '2 cups water'],
      }),
    ];

    const groups = groupIngredientsByCategory(recipes);
    const items = Object.values(groups).flat();

    const garlic = items.find((item) => item.display.startsWith('11-12 cloves garlic'));
    expect(garlic?.recipes).toEqual([
      'Chicken Caesar Salad',
      'Roasted Pork Tenderloin',
      'Chili Con Carne',
    ]);

    const onions = items.find((item) => item.display.startsWith('6 onions'));
    expect(onions?.recipes).toEqual([
      'Chicken Caesar Salad',
      'Roasted Pork Tenderloin',
      'Chili Con Carne',
    ]);

    const bayLeaves = items.find((item) => item.display.startsWith('3 bay leaves'));
    expect(bayLeaves?.recipes).toEqual(['Chicken Caesar Salad', 'Roasted Pork Tenderloin']);

    expect(items.some((item) => item.display.includes('water'))).toBe(false);
    expect(groups.Produce?.length).toBeGreaterThan(0);
    expect(groups['Spices&Oils']?.length).toBeGreaterThan(0);
  });

  it('keeps singular units for single quantities', () => {
    const recipes: Recipe[] = [
      buildRecipe({
        slug: 'single-garlic',
        title: 'Single Garlic',
        ingredients: ['1 clove garlic'],
      }),
    ];

    const groups = groupIngredientsByCategory(recipes);
    const items = Object.values(groups).flat();
    expect(items[0]?.display).toBe('1 clove garlic');
  });
});
