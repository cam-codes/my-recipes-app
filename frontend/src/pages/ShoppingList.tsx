import { createMemo, createResource, createSignal, For, Show, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { useShoppingList } from '../context/ShoppingListContext';
import { getRecipe } from '../lib/api';
import { INGREDIENT_CATEGORY_MAP, DEFAULT_CATEGORY, type Category } from '../lib/ingredientCategories';
import type { Recipe } from '../lib/types';
import LoadingSpinner from '../components/LoadingSpinner';

type GroupedIngredient = {
  key: string;
  ingredient: string;
  recipe: string;
};

export default function ShoppingList() {
  const { selected, clear } = useShoppingList();
  const [checked, setChecked] = createSignal<Set<string>>(new Set());
  const [dark, setDark] = createSignal(false);

  const selectedSlugs = createMemo(() => Array.from(selected()));

  const [recipes] = createResource(selectedSlugs, async (slugs) => {
    if (slugs.length === 0) return [];
    return Promise.all(slugs.map((slug) => getRecipe(slug)));
  });

  onMount(() => {
    const stored = localStorage.getItem('dark');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(stored ? stored === 'true' : prefersDark);
  });

  const toggleDark = () => {
    setDark((enabled) => {
      localStorage.setItem('dark', String(!enabled));
      return !enabled;
    });
  };

  const groupedItems = createMemo(() => {
    const recipeList = recipes() ?? [];
    const groups: Partial<Record<Category, GroupedIngredient[]>> = {};

    for (const recipe of recipeList as Recipe[]) {
      for (const ingredient of recipe.ingredients) {
        const key = `${ingredient}-${recipe.slug}`;
        const normalized = ingredient.toLowerCase();
        const category = INGREDIENT_CATEGORY_MAP[normalized] ?? DEFAULT_CATEGORY;
        groups[category] ??= [];
        groups[category]!.push({ key, ingredient, recipe: recipe.title });
      }
    }

    return groups;
  });

  const remainingCount = createMemo(
    () =>
      (Object.values(groupedItems()).flat() as GroupedIngredient[]).filter(
        (item) => !checked().has(item.key),
      ).length,
  );

  const toggleChecked = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div class={dark() ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50'}>
      <div class="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow px-4 py-3 flex justify-between items-center">
        <h1 class="text-lg font-semibold">Shopping List ({remainingCount()} left)</h1>
        <button onClick={toggleDark} class="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700">
          {dark() ? 'Light' : 'Dark'}
        </button>
      </div>

      <div class="max-w-3xl mx-auto px-4 py-6">
        <Show
          when={!recipes.loading}
          fallback={
            <div class="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          }
        >
          <Show
            when={Object.keys(groupedItems()).length > 0}
            fallback={
              <p class="text-center text-gray-500">
                No recipes selected.{' '}
                <A href="/" class="underline text-blue-500">
                  Go back
                </A>
              </p>
            }
          >
            <For each={Object.entries(groupedItems())}>
              {([category, items]) => (
                <section class="mb-8">
                  <h2 class="text-xl font-bold mb-3">{category}</h2>
                  <ul class="space-y-3">
                    <For each={items as GroupedIngredient[]}>
                      {(item) => (
                        <li
                          class="flex gap-4 items-start p-3 rounded-lg bg-white dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 cursor-pointer select-none"
                          onClick={() => toggleChecked(item.key)}
                        >
                          <input
                            type="checkbox"
                            checked={checked().has(item.key)}
                            readOnly
                            class="mt-1 scale-125"
                          />
                          <span class={checked().has(item.key) ? 'line-through text-gray-400' : ''}>
                            {item.ingredient} <span class="text-sm text-gray-500">({item.recipe})</span>
                          </span>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
              )}
            </For>
          </Show>
        </Show>

        <div class="mt-10 flex justify-between">
          <A href="/" class="text-blue-500">
            ← Back
          </A>
          <button onClick={clear} class="text-red-500">
            Clear selection
          </button>
        </div>
      </div>
    </div>
  );
}
