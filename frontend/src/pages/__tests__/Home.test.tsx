import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import Home from '../Home.tsx';
import type { Recipe } from '../../lib/types.ts';
import { ShoppingListProvider } from '../../context/ShoppingListContext.tsx';

// mock the api module
import * as api from '../../lib/api.ts';

vi.mock('../../lib/api', () => ({
  getRecipes: vi.fn(),
}));

import makeRecipe from '../../test/setup.ts';

const navigateMock = vi.hoisted(() => vi.fn());

// mock the router before importing the component
vi.mock('@solidjs/router', () => ({
  A: (props: any) => <a {...props} />,
  useNavigate: () => navigateMock,
}));

const mockRecipes: Recipe[] = [
  makeRecipe({
    slug: 'miso-salmon',
    title: 'Miso Salmon',
    image: '/recipes/miso-salmon/salmon.jpg',
  }),
  makeRecipe({ slug: 'osso-bucco', title: 'Osso Bucco', image: '/image.jpg' }),
];

beforeEach(() => {
  navigateMock.mockReset();
});

it('renders recipe list', async () => {
  (api.getRecipes as vi.Mock).mockResolvedValue(mockRecipes);
  render(() => (
    <ShoppingListProvider>
      <Home />
    </ShoppingListProvider>
  ));

  // wait for resolution
  await waitFor(async () => {
    expect(screen.getByText('Miso Salmon')).toBeInTheDocument();
    expect(screen.getByText('Osso Bucco')).toBeInTheDocument();

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'api/recipes/miso-salmon/salmon.jpg');
  });
});

it('toggles selection mode and clears selections', async () => {
  (api.getRecipes as vi.Mock).mockResolvedValue([mockRecipes[0]]);
  render(() => (
    <ShoppingListProvider>
      <Home />
    </ShoppingListProvider>
  ));

  await screen.findByText('Miso Salmon');

  fireEvent.click(screen.getByRole('button', { name: /select recipes/i }));

  expect(screen.getByRole('button', { name: /clear selections/i })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /generate shopping list from selections/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/tap recipe cards to select ingredients for your list/i),
  ).toBeInTheDocument();

  const recipeCardButton = screen.getByRole('button', { name: /miso salmon/i });
  fireEvent.click(recipeCardButton);
  expect(screen.getByText(/selected/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /clear selections/i }));
  expect(screen.getByText(/tap to select/i)).toBeInTheDocument();
});

it('navigates to the shopping list when generating with selections', async () => {
  (api.getRecipes as vi.Mock).mockResolvedValue([mockRecipes[0]]);
  render(() => (
    <ShoppingListProvider>
      <Home />
    </ShoppingListProvider>
  ));

  await screen.findByText('Miso Salmon');

  fireEvent.click(screen.getByRole('button', { name: /select recipes/i }));
  fireEvent.click(screen.getByRole('button', { name: /miso salmon/i }));
  fireEvent.click(screen.getByRole('button', { name: /generate shopping list from selections/i }));

  expect(navigateMock).toHaveBeenCalledWith('/shopping-list');
});
