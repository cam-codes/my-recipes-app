import { render, fireEvent } from '@solidjs/testing-library';
import { Router } from '@solidjs/router';
import { ShoppingListProvider } from '../context/ShoppingListContext.tsx';
import RecipeListItem from './RecipeListItem';

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
    <Router>
      <ShoppingListProvider>
        <RecipeListItem recipe={recipe} selectionEnabled />
      </ShoppingListProvider>
    </Router>
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
