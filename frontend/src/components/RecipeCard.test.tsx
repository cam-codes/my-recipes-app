import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import RecipeCard from './RecipeCard';
import type { RecipeListItem } from '../lib/types';

vi.mock('@solidjs/router', () => ({
  A: (props: any) => <a {...props} />,
  useNavigate: () => () => {},
}));

const recipe: RecipeListItem = {
  slug: 'test-slug',
  title: 'Test Recipe',
  description: 'Test description',
  prepTime: 5,
  cookTime: 10,
  image: '/image.jpg',
};

describe('RecipeCard', () => {
  it('renders a link when not selectable', () => {
    render(() => <RecipeCard recipe={recipe} />);

    const link = screen.getByRole('link', { name: /test recipe/i });
    expect(link).toHaveAttribute('href', '/recipe/test-slug');
    expect(screen.queryByText(/tap to select/i)).toBeNull();
  });

  it('renders a selectable card and calls toggle', () => {
    const onToggleSelect = vi.fn();
    render(() => (
      <RecipeCard
        recipe={recipe}
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
      <RecipeCard recipe={recipe} isSelectable isSelected onToggleSelect={() => {}} />
    ));

    expect(screen.getByText(/selected/i)).toBeInTheDocument();
  });
});
