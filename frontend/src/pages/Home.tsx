import { useNavigate } from '@solidjs/router';
import { createMemo, createResource, createSignal, For, onMount, Show } from 'solid-js';
import { getRecipes } from '../lib/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import RatingStars from '../components/RatingStars';
import { useShoppingList } from '../context/ShoppingListContext';
import type { RecipeListItem } from '../lib/types';
import {
  buildCollections,
  COLLECTION_KEYS,
  COLLECTIONS,
  PREVIEW_TRANSFORMS,
  type CollectionKey,
  type SortMode,
} from '../lib/recipeCollections';

const RecipePreviewCard = (props: { recipe: RecipeListItem }) => (
  <div class="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-md overflow-hidden border-2 border-transparent dark:border-slate-800">
    {props.recipe.image && (
      <img
        src={`api${props.recipe.image}`}
        alt={props.recipe.title}
        class="w-full aspect-3/2 object-cover"
      />
    )}
    <div class="p-4">
      <h3 class="text-base font-semibold mb-2 line-clamp-2">{props.recipe.title}</h3>
      <RatingStars
        average={props.recipe.ratingAverage}
        count={props.recipe.ratingCount}
        size="sm"
        showSummary={false}
      />
    </div>
  </div>
);

export default function Home() {
  const [recipes] = createResource(getRecipes);
  const navigate = useNavigate();
  const { selected, toggle, clear } = useShoppingList();
  const [isSelecting, setIsSelecting] = createSignal(false);
  const [expanded, setExpanded] = createSignal<Record<CollectionKey, boolean>>({
    savory: false,
    sweet: false,
  });
  const [sortMode, setSortMode] = createSignal<Record<CollectionKey, SortMode>>({
    savory: 'alpha',
    sweet: 'alpha',
  });
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

  const toggleCollection = (key: CollectionKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSortMode = (key: CollectionKey, value: SortMode) => {
    setSortMode((prev) => ({ ...prev, [key]: value }));
  };

  const collections = createMemo(() => {
    const list = recipes() ?? [];
    return buildCollections(list, sortMode());
  });

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Heading */}
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
          Delicious Recipes
        </h1>
        <p class="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Browse curated collections, expand the set you want, and build a grocery list in a couple
          of clicks.
        </p>

        <div class="flex flex-wrap justify-center items-center gap-3">
          <Show
            when={isSelecting()}
            fallback={
              <button
                type="button"
                onClick={startSelecting}
                class="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition"
              >
                Select Recipes for Grocery List
              </button>
            }
          >
            <button
              type="button"
              onClick={clearSelections}
              class="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 transition"
            >
              Clear Selections
            </button>
            <button
              type="button"
              onClick={generateShoppingList}
              class="px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 transition text-sm sm:text-base whitespace-normal leading-snug"
            >
              Generate Grocery List From Selections
            </button>
          </Show>
        </div>

        <Show when={isSelecting()}>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Tap recipe cards to select ingredients for your list.
          </p>
        </Show>
      </div>

      {/* Collection Grid */}
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
          fallback={
            <p class="text-center text-gray-500 dark:text-gray-400 py-20 text-lg">
              No recipes found.
            </p>
          }
        >
          <div class="space-y-10">
            <For each={COLLECTION_KEYS}>
              {(key) => {
                const meta = COLLECTIONS[key];
                const items = () => collections()[key];
                const previewItems = () => items().slice(0, 5);
                const isExpanded = () => expanded()[key];
                const currentSort = () => sortMode()[key];

                return (
                  <section>
                    <div
                      class={`relative overflow-hidden rounded-3xl border border-gray-200 dark:border-slate-800 bg-gradient-to-br ${meta.accent}`}
                    >
                      <div
                        class={`absolute -top-20 -right-16 h-48 w-48 rounded-full blur-3xl ${meta.glow}`}
                      />
                      <div class="relative px-6 py-6 sm:px-8 sm:py-8">
                        <button
                          type="button"
                          onClick={() => toggleCollection(key)}
                          aria-expanded={isExpanded()}
                          aria-controls={`collection-${key}`}
                          aria-label={`Toggle ${meta.title} collection`}
                          class="absolute inset-0 rounded-3xl z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                        />
                        <div class="relative z-0 flex flex-col lg:flex-row lg:items-center gap-6">
                          <div class="flex-1 space-y-3">
                            <p class="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                              Collection
                            </p>
                            <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
                              {meta.title}
                            </h2>
                            <p class="text-sm text-gray-500 dark:text-gray-300 max-w-lg">
                              {meta.description}
                            </p>
                            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span>{items().length} recipes</span>
                              <span>-</span>
                              <span>
                                Sorted {currentSort() === 'alpha' ? 'alphabetically' : 'by rating'}
                              </span>
                              <span>-</span>
                              <span>{isExpanded() ? 'Click to collapse' : 'Click to expand'}</span>
                            </div>
                          </div>
                          <div class="relative h-48 w-full lg:w-[340px]">
                            <Show
                              when={previewItems().length > 0}
                              fallback={
                                <div class="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 text-sm text-gray-400">
                                  No previews yet
                                </div>
                              }
                            >
                              <div class="absolute inset-0 pointer-events-none">
                                <For each={previewItems()}>
                                  {(recipe, index) => {
                                    const transform = createMemo(
                                      () =>
                                        PREVIEW_TRANSFORMS[index()] ??
                                        PREVIEW_TRANSFORMS[PREVIEW_TRANSFORMS.length - 1],
                                    );
                                    const zIndex = createMemo(() => index() + 1);
                                    return (
                                      <div
                                        class="absolute inset-0 flex items-center justify-center"
                                        style={`transform: translate(${transform().x}px, ${transform().y}px) rotate(${transform().rotate}deg) scale(${transform().scale}); z-index: ${zIndex()};`}
                                      >
                                        <div class="w-52 sm:w-56 shadow-xl">
                                          <RecipePreviewCard recipe={recipe} />
                                        </div>
                                      </div>
                                    );
                                  }}
                                </For>
                              </div>
                            </Show>
                          </div>
                        </div>
                      </div>

                      <Show when={isExpanded()}>
                        <div
                          id={`collection-${key}`}
                          class="border-t border-gray-200 dark:border-slate-800 px-6 pb-8 pt-6 sm:px-8"
                        >
                          <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <label class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                              <span class="font-medium">Sort by</span>
                              <select
                                value={currentSort()}
                                onChange={(event) =>
                                  updateSortMode(key, event.currentTarget.value as SortMode)
                                }
                                class="rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-sm"
                              >
                                <option value="alpha">Alphabetical</option>
                                <option value="rating">Rating</option>
                              </select>
                            </label>
                            <button
                              type="button"
                              onClick={() => toggleCollection(key)}
                              class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                            >
                              Collapse
                            </button>
                          </div>

                          <div
                            data-testid={`collection-${key}-list`}
                            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                          >
                            <For each={items()}>
                              {(recipe) => (
                                <RecipeCard
                                  recipe={recipe}
                                  isSelectable={isSelecting()}
                                  isSelected={selected().has(recipe.slug)}
                                  onToggleSelect={toggle}
                                />
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </section>
                );
              }}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
}
