import { render, fireEvent, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { onMount } from 'solid-js';
import ShoppingList from './ShoppingList';
import { ShoppingListProvider, useShoppingList } from '../context/ShoppingListContext';
import type { Recipe } from '../lib/types';

const getRecipeMock = vi.hoisted(() => vi.fn());
const clipboardWriteMock = vi.hoisted(() => vi.fn());

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
    clipboardWriteMock.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWriteMock },
      configurable: true,
    });
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

  it('imports a line-separated list and categorizes items', async () => {
    render(() => (
      <ShoppingListProvider>
        <ShoppingList />
      </ShoppingListProvider>
    ));

    const textarea = screen.getByLabelText(/import list/i);
    fireEvent.input(textarea, {
      target: { value: '1 cup sugar\n2 cups flour' },
    });

    fireEvent.click(screen.getByRole('button', { name: /import list/i }));

    expect(await screen.findByText(/1 cup sugar/i)).toBeInTheDocument();
    expect(screen.getByText(/2 cups flour/i)).toBeInTheDocument();
    expect(screen.getByText(/dry goods/i)).toBeInTheDocument();
    expect(screen.getAllByText(/imported/i).length).toBeGreaterThan(0);
  });

  it('copies the list to the clipboard as plain text', async () => {
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

    await screen.findByText(/3 cloves garlic/i);

    fireEvent.click(screen.getByRole('button', { name: /copy list to clipboard/i }));

    await waitFor(() => {
      expect(clipboardWriteMock).toHaveBeenCalled();
    });

    const copiedText = clipboardWriteMock.mock.calls[0]?.[0];
    expect(copiedText).toMatch(/Produce/);
    expect(copiedText).toMatch(/3 cloves garlic/i);
  });
});
