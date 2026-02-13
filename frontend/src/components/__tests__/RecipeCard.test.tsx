import { render, screen } from '@solidjs/testing-library';
import RecipeCard from '../RecipeCard.tsx';
import makeRecipe from '../../test/setup.ts';

// mock the router before importing the component
vi.mock('@solidjs/router', () => ({
  useParams: () => ({ slug: 'miso-salmon' }),
  A: (props: any) => <a {...props} />,
  useNavigate: () => () => {},
}));

it('renders recipe card data', () => {
  const recipe = makeRecipe({
    slug: 'miso-salmon',
    title: 'Miso Salmon',
    image: '/recipes/miso-salmon/image.jpg',
    description: 'Great Recipe',
  });

  render(() => <RecipeCard recipe={recipe} />);

  expect(screen.getByText('Miso Salmon')).toBeInTheDocument();
  expect(screen.getByRole('img')).toHaveAttribute('src', 'api/recipes/miso-salmon/image.jpg');
  expect(screen.getByText('Great Recipe')).toBeInTheDocument();
});
