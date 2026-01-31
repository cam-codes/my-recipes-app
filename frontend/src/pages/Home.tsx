import { createResource, createSignal, Show } from 'solid-js';
import { getRecipes } from '../lib/api';
// import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { RecipeListItem } from "../components/RecipeListItem.tsx";
// import { useShoppingList } from "../context/ShoppingListContext.tsx";

export default function Home() {
  const [recipes] = createResource(getRecipes);
  const [selectMode, setSelectMode] = createSignal(false);
  // const shoppingList = useShoppingList();

  const toggleSelectMode = () => setSelectMode(prev => !prev);

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Heading */}
      <h1 class="text-4xl font-extrabold text-center mb-8 text-gray-900">
        Delicious Recipes
      </h1>

      <p class="text-center text-gray-500 mb-12">
        Browse our collection of tasty recipes and find your next favorite meal!
      </p>

      {/* Select Recipes Button */}
      <div class="text-center mb-8">
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={toggleSelectMode}
        >
          {selectMode() ? 'Done Selecting' : 'Select recipes for grocery list'}
        </button>
      </div>

      {/*<Show when={isSelecting()}>*/}
      {/*  <div class="flex justify-center mt-4">*/}
      {/*    <A*/}
      {/*      href="/shopping-list"*/}
      {/*      class="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"*/}
      {/*    >*/}
      {/*      Generate shopping list*/}
      {/*    </A>*/}
      {/*  </div>*/}
      {/*</Show>*/}

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
              <RecipeListItem
                recipe={recipe}
                selectionEnabled={selectionEnabled()}
              />
            ))}
          </div>
        </Show>
      </Show>
    </div>
  );
}
