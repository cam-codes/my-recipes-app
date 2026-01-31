import {
  createMemo,
  createSignal,
  For,
  Show,
  onMount,
} from 'solid-js';
import { A } from '@solidjs/router';
import { useShoppingList } from '../context/ShoppingListContext';
import { createResource } from "solid-js";
import { getRecipes } from "../lib/api.ts";
import {
  INGREDIENT_CATEGORY_MAP,
  DEFAULT_CATEGORY,
  type Category,
} from "../lib/ingredientCategories.ts";
import type { Recipe } from "../components/Recipe.tsx";

export default function ShoppingList() {
  const { selected, clear } = useShoppingList();
  const [checked, setChecked] = createSignal<Set<string>>(new Set());
  const [dark, setDark] = createSignal<boolean>(false);

  const [recipes] = createResource<Recipe[]>(getRecipes);

  // dark mode init
  onMount(() => {
    const stored = localStorage.getItem('dark');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(stored ? stored === 'true' : prefersDark);
  });

  const toggleDark = () => {
    setDark(d => {
      localStorage.setItem('dark', String(!d));
      return !d;
    });
  };

  const groupedItems = createMemo(() => {
    if (!recipes()) return {};

    const groups: Record<Category, any[]> = {} as any;

    for (const recipe of recipes()!) {
      if (!selected().has(recipe.slug)) continue;

      for (const ing of recipe.ingredients) {
        const key = `${ing}-${recipe.slug}`
        const normalized = ing.toLowerCase();
        const category = INGREDIENT_CATEGORY_MAP[normalized] ?? DEFAULT_CATEGORY;
        groups[category] ??= [];
        groups[category].push({
          key,
          ingredient: ing,
          recipe: recipe.title,
        });
      }
    }
    return groups;
  });

  const remainingCount = createMemo(
    () =>
      (Object.values(groupedItems()).flat() as { key: string }[])
        .filter((i: { key: string }) => !checked().has(i.key)).length
  );

  const toggleChecked = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // const items = createMemo(() => {
  //   if (!recipes()) return [];
  //
  //   return recipes()!
  //     .filter(r => selected().has(r.slug))
  //     .flatMap(recipe => {
  //       recipe.ingredients.map(ing => ({
  //         key: `${ing}-${recipe.slug}`,
  //         ingredient: ing,
  //         recipe: recipe.title,
  //       }))
  //     }); // todo: might need to remove the curly brace here
  // });

  return (
    <div class={dark() ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50'}>
      {/* Sticky Header */}
      <div class="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow px-4 py-3 flex justify-between items-center">
        <h1 class="text-lg font-semibold">
          Shopping List ({remainingCount()} left)
        </h1>
        <button
          onClick={toggleDark}
          class="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
        >
          {dark() ? 'Light' : 'Dark'}
        </button>
      </div>

      <div class="max-w-3xl mx-auto px-4 py-6">
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
                  <For each={items as { key: string; ingredient: string; recipe: string}[]}>
                    {item => (
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
                        <span
                          class={
                            checked().has(item.key)
                              ? 'line-through text-gray-400'
                              : ''
                          }
                        >
                          {item.ingredient}{' '}
                          <span class="text-sm text-gray-500">
                            ({item.recipe})
                          </span>
                        </span>
                      </li>
                    )}
                  </For>
                </ul>
              </section>
            )}
          </For>
        </Show>

        <div class="mt-10 flex justify-between">
          <A href="/" class="text-blue-500">← Back</A>
          <button
            onClick={clear}
            class="text-red-500"
          >
            Clear selection
          </button>
        </div>
      </div>
    </div>
  );
}
