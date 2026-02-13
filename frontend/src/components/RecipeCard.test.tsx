import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import RecipeCard from './RecipeCard';
import makeRecipe from '../test/setup';
import type { RecipeListItem } from '../lib/types';

// mock the router before importing the component
vi.mock('@solidjs/router', () => ({
  useParams: () => ({ slug: 'miso-salmon' }),
  A: (props: any) => <a {...props} />,
  useNavigate: () => () => {},
}));

const baseRecipe: RecipeListItem = makeRecipe({
  slug: 'test-slug',
  title: 'Test Recipe',
  description: 'Test description',
  prepTime: 5,
  cookTime: 10,
  image: '/image.jpg',
  ratingAverage: 0,
  ratingCount: 0,
});

describe('RecipeCard', () => {
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

  it('renders a link when not selectable', () => {
    render(() => <RecipeCard recipe={baseRecipe} />);

    const link = screen.getByRole('link', { name: /test recipe/i });
    expect(link).toHaveAttribute('href', '/recipe/test-slug');
    expect(screen.queryByText(/tap to select/i)).toBeNull();
  });

  it('renders a selectable card and calls toggle', () => {
    const onToggleSelect = vi.fn();
    render(() => (
      <RecipeCard
        recipe={baseRecipe}
        isSelectable
        isSelected={false}
        onToggleSelect={onToggleSelect}
      />
    ));

    fireEvent.click(screen.getByRole('button'));
    expect(onToggleSelect).toHaveBeenCalledWith('test-slug');
    expect(screen.getByText(/tap to select/i)).toBeInTheDocument();
  });

  it('shows selected state when selected', () => {
    render(() => (
      <RecipeCard recipe={baseRecipe} isSelectable isSelected onToggleSelect={() => {}} />
    ));

    expect(screen.getByText(/selected/i)).toBeInTheDocument();
  });
});
