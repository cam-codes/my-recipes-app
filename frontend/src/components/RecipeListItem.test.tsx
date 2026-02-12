import { render, fireEvent } from '@solidjs/testing-library';
import { ShoppingListProvider } from '../context/ShoppingListContext';
import RecipeListItem from './RecipeListItem';
import { vi } from 'vitest';

// mock the router
vi.mock('@solidjs/router', () => ({
  A: (props: Record<string, unknown>) => <a {...props} />,
}));

const recipe = {
  slug: 'test-recipe',
  title: 'Test Recipe',
  description: 'desc',
  prepTime: 10,
  cookTime: 20,
  image: '/img.jpg',
};

function renderWithProviders() {
  return render(() => (
    <ShoppingListProvider>
      <RecipeListItem recipe={recipe} selectionEnabled />
    </ShoppingListProvider>
  ));
}

describe('RecipeListItem selection mode', () => {
  it('toggles selection instead of navigating', async () => {
    const { getByRole } = renderWithProviders();

    const checkbox = getByRole('checkbox');

    expect(checkbox).not.toBeChecked();

    await fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });
});
