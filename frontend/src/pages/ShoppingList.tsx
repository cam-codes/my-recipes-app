import { createMemo, createResource, createSignal, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { useShoppingList } from '../context/ShoppingListContext';
import { getRecipe } from '../lib/api';
import type { GroupedIngredient } from '../lib/types';
import LoadingSpinner from '../components/LoadingSpinner';
import { groupIngredientsByCategory } from '../lib/utils';

export default function ShoppingList() {
  const { selected } = useShoppingList();
  const [checked, setChecked] = createSignal<Set<string>>(new Set());

  const selectedSlugs = createMemo(() => Array.from(selected()));

  const [recipes] = createResource(selectedSlugs, async (slugs) => {
    if (slugs.length === 0) return [];
    return Promise.all(slugs.map((slug) => getRecipe(slug)));
  });

  const groupedItems = createMemo(() => groupIngredientsByCategory(recipes() ?? []));

  const remainingCount = createMemo(
    () =>
      (Object.values(groupedItems()).flat() as GroupedIngredient[]).filter(
        (item) => !checked().has(item.key),
      ).length,
  );

  const toggleChecked = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const clearChecked = () => setChecked(new Set<string>());

  return (
    <div class="bg-gray-50">
      <div class="sticky top-0 z-10 bg-white shadow px-4 py-3 flex items-center">
        <h1 class="text-lg font-semibold">Shopping List ({remainingCount()} left)</h1>
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
                          class="flex gap-4 items-start p-3 rounded-lg bg-white active:bg-gray-100 cursor-pointer select-none"
                          onClick={() => toggleChecked(item.key)}
                        >
                          <input
                            type="checkbox"
                            checked={checked().has(item.key)}
                            readOnly
                            class="mt-1 scale-125"
                          />
                          <span class={checked().has(item.key) ? 'line-through text-gray-400' : ''}>
                            {item.display}{' '}
                            <span class="text-sm text-gray-500">({item.recipes.join(', ')})</span>
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
          <button onClick={clearChecked} class="text-red-500">
            Clear checked items
          </button>
        </div>
      </div>
    </div>
  );
}
