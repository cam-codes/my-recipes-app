import { createResource, createSignal, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { createResource, onMount, Show } from 'solid-js';
import { getRecipes } from '../lib/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useShoppingList } from '../context/ShoppingListContext';

export default function Home() {
  const [recipes] = createResource(getRecipes);
  onMount(() => {
    document.title = 'Cook with Cam';
  });
  const [selectMode, setSelectMode] = createSignal(false);
  const shoppingList = useShoppingList();

  const toggleSelectMode = () => setSelectMode((prev) => !prev);

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Heading */}
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-center mb-8 text-gray-900">Delicious Recipes</h1>
        <p class="text-center text-gray-500 mb-12">
          Browse our collection of tasty recipes and find your next favorite meal!
        </p>
      </div>
      <h1 class="text-4xl font-extrabold text-center mb-8 text-gray-900">Delicious Recipes</h1>

      <p class="text-center text-gray-500 mb-12">
        Browse our collection of tasty recipes and find your next favorite meal!
      </p>

      <div class="text-center mb-8 space-x-4">
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={toggleSelectMode}
        >
          {selectMode() ? 'Done Selecting' : 'Select recipes for grocery list'}
        </button>
        <Show when={shoppingList.selected().size > 0}>
          <A
            href="/shopping-list"
            class="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Generate shopping list ({shoppingList.selected().size})
          </A>
        </Show>
      </div>

      <Show
        when={!recipes.loading}
        fallback={
          <div class="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        }
      >
        <Show
          when={recipes() && recipes()!.length > 0}
          fallback={<p class="text-center text-gray-500 py-20 text-lg">No recipes found.</p>}
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes()!.map((recipe) => (
              <RecipeCard recipe={recipe} selectable={selectMode()} />
            ))}
          </div>
        </Show>
      </Show>
    </div>
  );
}
