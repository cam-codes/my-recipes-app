import { useNavigate } from '@solidjs/router';
import { createResource, createSignal, onMount, Show } from 'solid-js';
import { getRecipes } from '../lib/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useShoppingList } from '../context/ShoppingListContext';

export default function Home() {
  const [recipes] = createResource(getRecipes);
  const navigate = useNavigate();
  const { selected, toggle, clear } = useShoppingList();
  const [isSelecting, setIsSelecting] = createSignal(false);
  onMount(() => {
    document.title = 'Cook with Cam';
  });

  const startSelecting = () => setIsSelecting(true);
  const clearSelections = () => clear();
  const generateShoppingList = () => {
    setIsSelecting(false);
    if (selected().size > 0) {
      navigate('/shopping-list');
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Heading */}
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-center mb-8 text-gray-900">Delicious Recipes</h1>
        <p class="text-center text-gray-500 mb-8">
          Browse our collection of tasty recipes and find your next favorite meal!
        </p>

        <div class="flex flex-wrap justify-center items-center gap-3">
          <Show
            when={isSelecting()}
            fallback={
              <button
                type="button"
                onClick={startSelecting}
                class="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Select Recipes for Grocery List
              </button>
            }
          >
            <button
              type="button"
              onClick={clearSelections}
              class="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Clear Selections
            </button>
            <button
              type="button"
              onClick={generateShoppingList}
              class="px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition text-sm sm:text-base whitespace-normal leading-snug"
            >
              Generate Grocery List From Selections
            </button>
          </Show>
        </div>

        <Show when={isSelecting()}>
          <p class="text-sm text-gray-500 mt-3">
            Tap recipe cards to select ingredients for your list.
          </p>
        </Show>
      </div>

      {/* Recipes Grid */}
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
              <RecipeCard
                recipe={recipe}
                isSelectable={isSelecting()}
                isSelected={selected().has(recipe.slug)}
                onToggleSelect={toggle}
              />
            ))}
          </div>
        </Show>
      </Show>
    </div>
  );
}
