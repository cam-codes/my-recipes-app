import { render, screen } from '@solidjs/testing-library';
import { vi } from 'vitest';
import RecipeCard from './RecipeCard';
import makeRecipe from '../test/setup.ts';
import { ShoppingListProvider } from '../context/ShoppingListContext';

// mock the router before importing the component
vi.mock('@solidjs/router', () => ({
  useParams: () => ({ slug: 'miso-salmon' }),
  A: (props: Record<string, unknown>) => <a {...props} />,
}));

it('renders recipe card data', () => {
  const recipe = makeRecipe({
    slug: 'miso-salmon',
    title: 'Miso Salmon',
    image: '/recipes/miso-salmon/image.jpg',
    description: 'Great Recipe',
  });

  render(() => (
    <ShoppingListProvider>
      <RecipeCard recipe={recipe} />
    </ShoppingListProvider>
  ));

  expect(screen.getByText('Miso Salmon')).toBeInTheDocument();
  expect(screen.getByRole('img')).toHaveAttribute('src', 'api/recipes/miso-salmon/image.jpg');
  expect(screen.getByText('Great Recipe')).toBeInTheDocument();
});
