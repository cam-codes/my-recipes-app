import { render, screen, waitFor } from '@solidjs/testing-library';
import Home from './Home';
import { expect, vi } from 'vitest';
import type { Recipe } from '../lib/types.ts';
import makeRecipe from '../test/setup.ts';
import { ShoppingListProvider } from '../context/ShoppingListContext';

// mock the api module
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  getRecipes: vi.fn(),
}));

// mock the router
vi.mock('@solidjs/router', () => ({
  A: (props: Record<string, unknown>) => <a {...props} />,
}));

// mock RecipeCard to only focus on Home's rendering (not links)
vi.mock('../components/RecipeCard', () => ({
  default: (props: { recipe: Recipe }) => (
    <div data-testid="recipe-card" class="mock-card">
      <h3>{props.recipe.title}</h3>
      {props.recipe.image && <img src={props.recipe.image} alt={props.recipe.title} />}
    </div>
  ),
}));

const mockRecipes: Recipe[] = [
  makeRecipe({
    slug: 'miso-salmon',
    title: 'Miso Salmon',
    image: '/recipes/miso-salmon/salmon.jpg',
  }),
  makeRecipe({ slug: 'osso-bucco', title: 'Osso Bucco', image: '/image.jpg' }),
];

it('renders recipe list', async () => {
  vi.mocked(api.getRecipes).mockResolvedValue(mockRecipes);

  render(() => (
    <ShoppingListProvider>
      <Home />
    </ShoppingListProvider>
  ));

  // wait for resolution
  await waitFor(() => {
    expect(screen.getByText('Miso Salmon')).toBeInTheDocument();
    expect(screen.getByText('Osso Bucco')).toBeInTheDocument();

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', '/recipes/miso-salmon/salmon.jpg');
  });
});
