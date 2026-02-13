import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { onMount } from 'solid-js';
import ShoppingList from './ShoppingList';
import { ShoppingListProvider, useShoppingList } from '../context/ShoppingListContext';
import type { Recipe } from '../lib/types';

const getRecipeMock = vi.hoisted(() => vi.fn());

vi.mock('../lib/api', () => ({
  getRecipe: getRecipeMock,
}));

vi.mock('@solidjs/router', () => ({
  A: (props: any) => <a {...props} />,
  useNavigate: () => () => {},
}));

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
  ratingAverage: 0,
  ratingCount: 0,
  ...overrides,
});

const SeedSelections = (props: { slugs: string[] }) => {
  const { toggle } = useShoppingList();
  onMount(() => {
    props.slugs.forEach((slug) => toggle(slug));
  });
  return null;
};

describe('ShoppingList', () => {
  beforeEach(() => {
    getRecipeMock.mockReset();
  });

  it('shows an empty state when no recipes are selected', async () => {
    render(() => (
      <ShoppingListProvider>
        <ShoppingList />
      </ShoppingListProvider>
    ));

    expect(await screen.findByText(/no recipes selected/i)).toBeInTheDocument();
  });

  it('renders aggregated items and allows clearing checked items', async () => {
    const recipe = buildRecipe({
      slug: 'garlic-recipe',
      title: 'Garlic Recipe',
      ingredients: ['1 clove garlic', '2 cloves garlic, minced'],
    });

    getRecipeMock.mockResolvedValue(recipe);

    render(() => (
      <ShoppingListProvider>
        <SeedSelections slugs={['garlic-recipe']} />
        <ShoppingList />
      </ShoppingListProvider>
    ));

    expect(await screen.findByText(/3 cloves garlic/i)).toBeInTheDocument();
    expect(screen.getByText(/\(garlic recipe\)/i)).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(screen.getByText(/3 cloves garlic/i));
    expect(checkbox).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /clear checked items/i }));
    expect(checkbox).not.toBeChecked();
  });

  it('shows a loading state while recipes are fetched', async () => {
    getRecipeMock.mockImplementation(() => new Promise(() => {}));

    render(() => (
      <ShoppingListProvider>
        <SeedSelections slugs={['slow-recipe']} />
        <ShoppingList />
      </ShoppingListProvider>
    ));

    expect(await screen.findByRole('status', { name: /loading/i })).toBeInTheDocument();
  });
});
