import { fireEvent, render, screen, within } from '@solidjs/testing-library';
import Home from './Home';
import type { Recipe } from '../lib/types';
import { ShoppingListProvider } from '../context/ShoppingListContext';

// mock the api module
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  getRecipes: vi.fn(),
}));

import makeRecipe from '../test/setup';

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
    collection: 'savory',
    ratingAverage: 3.2,
  }),
  makeRecipe({
    slug: 'osso-bucco',
    title: 'Osso Bucco',
    image: '/image.jpg',
    collection: 'savory',
    ratingAverage: 4.7,
  }),
  makeRecipe({
    slug: 'chocolate-mousse',
    title: 'Chocolate Mousse',
    image: '/image.jpg',
    collection: 'sweet',
    ratingAverage: 4.9,
  }),
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

  const savoryToggle = await screen.findByRole('button', {
    name: /toggle savory collection/i,
  });
  fireEvent.click(savoryToggle);

  const savoryList = await screen.findByTestId('collection-savory-list');
  const savoryItems = within(savoryList);
  expect(savoryItems.getByText('Miso Salmon')).toBeInTheDocument();
  expect(savoryItems.getByText('Osso Bucco')).toBeInTheDocument();

  const sweetToggle = screen.getByRole('button', { name: /toggle sweet collection/i });
  fireEvent.click(sweetToggle);
  const sweetList = await screen.findByTestId('collection-sweet-list');
  const sweetItems = within(sweetList);
  expect(sweetItems.getByText('Chocolate Mousse')).toBeInTheDocument();
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
  fireEvent.click(screen.getByRole('button', { name: /toggle savory collection/i }));

  expect(screen.getByRole('button', { name: /clear selections/i })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /generate grocery list from selections/i }),
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
  fireEvent.click(screen.getByRole('button', { name: /toggle savory collection/i }));
  fireEvent.click(screen.getByRole('button', { name: /miso salmon/i }));
  fireEvent.click(screen.getByRole('button', { name: /generate grocery list from selections/i }));

  expect(navigateMock).toHaveBeenCalledWith('/shopping-list');
});

it('sorts recipes by rating within a collection', async () => {
  (api.getRecipes as vi.Mock).mockResolvedValue(mockRecipes);
  render(() => (
    <ShoppingListProvider>
      <Home />
    </ShoppingListProvider>
  ));

  const savoryToggle = await screen.findByRole('button', {
    name: /toggle savory collection/i,
  });
  fireEvent.click(savoryToggle);

  const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
  fireEvent.change(sortSelect, { target: { value: 'rating' } });

  const list = screen.getByTestId('collection-savory-list');
  const titles = Array.from(list.querySelectorAll('h3')).map((el) => el.textContent);
  expect(titles[0]).toBe('Osso Bucco');
});
