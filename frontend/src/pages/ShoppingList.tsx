import { createMemo, createResource, createSignal, For, onCleanup, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { useShoppingList } from '../context/ShoppingListContext';
import { getRecipe } from '../lib/api';
import type { GroupedIngredient, Recipe } from '../lib/types';
import LoadingSpinner from '../components/LoadingSpinner';
import { groupIngredientsByCategory } from '../lib/utils';

export default function ShoppingList() {
  const { selected } = useShoppingList();
  const [checked, setChecked] = createSignal<Set<string>>(new Set());
  const [importText, setImportText] = createSignal('');
  const [importedIngredients, setImportedIngredients] = createSignal<string[]>([]);
  const [copyStatus, setCopyStatus] = createSignal('');
  const [copyStatusVisible, setCopyStatusVisible] = createSignal(false);
  const [importStatus, setImportStatus] = createSignal('');
  const [importStatusVisible, setImportStatusVisible] = createSignal(false);
  const importedRecipeTitle = 'Imported items';
  const STATUS_TIMEOUT_MS = 2000;
  const STATUS_FADE_MS = 300;
  let copyFadeTimeout: number | undefined;
  let copyClearTimeout: number | undefined;
  let importFadeTimeout: number | undefined;
  let importClearTimeout: number | undefined;

  const selectedSlugs = createMemo(() => Array.from(selected()));

  const [recipes] = createResource(selectedSlugs, async (slugs) => {
    if (slugs.length === 0) return [];
    return Promise.all(slugs.map((slug) => getRecipe(slug)));
  });

  const importedRecipe = createMemo<Recipe | null>(() => {
    const items = importedIngredients();
    if (items.length === 0) return null;
    return {
      slug: 'imported-items',
      title: importedRecipeTitle,
      description: '',
      prepTime: 0,
      cookTime: 0,
      estimatedCost: 0,
      ingredients: items,
      instructions: [],
      tips: [],
      image: '',
      ratingAverage: 0,
      ratingCount: 0,
      collection: 'savory',
    };
  });

  const mergedRecipes = createMemo(() => {
    const list = recipes() ?? [];
    const imported = importedRecipe();
    return imported ? [...list, imported] : list;
  });

  const groupedItems = createMemo(() => groupIngredientsByCategory(mergedRecipes()));
  const hasItems = createMemo(() => Object.keys(groupedItems()).length > 0);

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

  onCleanup(() => {
    if (copyFadeTimeout) window.clearTimeout(copyFadeTimeout);
    if (copyClearTimeout) window.clearTimeout(copyClearTimeout);
    if (importFadeTimeout) window.clearTimeout(importFadeTimeout);
    if (importClearTimeout) window.clearTimeout(importClearTimeout);
  });

  const showCopyStatus = (message: string) => {
    setCopyStatus(message);
    setCopyStatusVisible(Boolean(message));
    if (copyFadeTimeout) window.clearTimeout(copyFadeTimeout);
    if (copyClearTimeout) window.clearTimeout(copyClearTimeout);
    if (!message) return;
    const fadeDelay = Math.max(0, STATUS_TIMEOUT_MS - STATUS_FADE_MS);
    copyFadeTimeout = window.setTimeout(() => setCopyStatusVisible(false), fadeDelay);
    copyClearTimeout = window.setTimeout(() => setCopyStatus(''), STATUS_TIMEOUT_MS);
  };

  const showImportStatus = (message: string) => {
    setImportStatus(message);
    setImportStatusVisible(Boolean(message));
    if (importFadeTimeout) window.clearTimeout(importFadeTimeout);
    if (importClearTimeout) window.clearTimeout(importClearTimeout);
    if (!message) return;
    const fadeDelay = Math.max(0, STATUS_TIMEOUT_MS - STATUS_FADE_MS);
    importFadeTimeout = window.setTimeout(() => setImportStatusVisible(false), fadeDelay);
    importClearTimeout = window.setTimeout(() => setImportStatus(''), STATUS_TIMEOUT_MS);
  };

  const normalizeImportedLine = (line: string) => {
    let cleaned = line.trim();
    // Strip leading numeric list markers like "1. " or "1) ".
    cleaned = cleaned.replace(/^\d+[.)]\s+/, '');
    // Strip task list prefixes like "[ ] " or "[x] ".
    cleaned = cleaned.replace(/^\[[ xX]]\s+/, '');
    // Strip common bullet prefixes like "- " or "* ".
    cleaned = cleaned.replace(/^[-*]\s+/, '');
    // Strip Unicode bullet prefix "• ".
    cleaned = cleaned.replace(/^\u2022\s+/, '');
    return cleaned.trim();
  };

  const importList = () => {
    const lines = importText()
      .split(/\r?\n/)
      .map((line) => normalizeImportedLine(line))
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      showImportStatus('Paste one item per line to import.');
      return;
    }

    setImportedIngredients((prev) => [...prev, ...lines]);
    setImportText('');
    showImportStatus(`Imported ${lines.length} item${lines.length === 1 ? '' : 's'}.`);
  };

  const buildClipboardText = () => {
    const groups = groupedItems();
    const lines: string[] = [];

    for (const [category, items] of Object.entries(groups)) {
      lines.push(category);
      for (const item of items as GroupedIngredient[]) {
        lines.push(`- ${item.display}`);
      }
      lines.push('');
    }

    return lines.join('\n').trim();
  };

  const copyToClipboard = async () => {
    if (!hasItems()) {
      showCopyStatus('Nothing to copy yet.');
      return;
    }

    const text = buildClipboardText();
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(text);
      showCopyStatus('Copied to clipboard.');
    } catch {
      showCopyStatus('Copy failed. Please try again.');
    }
  };

  return (
    <div class="bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow px-4 py-3 flex items-center">
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
              <p class="text-center text-gray-500 dark:text-gray-400">
                No recipes selected.{' '}
                <A href="/" class="underline text-blue-500 dark:text-blue-400">
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
                      {(item) => {
                        const hasImported = item.recipes.includes(importedRecipeTitle);
                        const sources = item.recipes.filter(
                          (recipe) => recipe !== importedRecipeTitle,
                        );
                        const labels = [...sources, ...(hasImported ? ['Imported'] : [])];
                        return (
                          <li
                            class="flex gap-4 items-start p-3 rounded-lg bg-white dark:bg-slate-900 active:bg-gray-100 dark:active:bg-slate-800 cursor-pointer select-none"
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
                                  ? 'line-through text-gray-400 dark:text-gray-500'
                                  : ''
                              }
                            >
                              {item.display}{' '}
                              <Show when={labels.length > 0}>
                                <span class="text-sm text-gray-500 dark:text-gray-400">
                                  ({labels.join(', ')})
                                </span>
                              </Show>
                            </span>
                          </li>
                        );
                      }}
                    </For>
                  </ul>
                </section>
              )}
            </For>
          </Show>
        </Show>

        <div class="mt-8 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyToClipboard}
              disabled={!hasItems()}
              class={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                hasItems()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-slate-800 dark:text-gray-500'
              }`}
            >
              Copy list to clipboard
            </button>
            <Show when={copyStatus()}>
              <span
                class={`text-xs text-gray-500 dark:text-gray-400 transition-opacity duration-300 ${
                  copyStatusVisible() ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {copyStatus()}
              </span>
            </Show>
          </div>

          <div class="space-y-2">
            <label for="import-list" class="text-sm font-semibold">
              Import list
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Paste one item per line to add it to your shopping list.
            </p>
            <textarea
              id="import-list"
              value={importText()}
              onInput={(event) => setImportText(event.currentTarget.value)}
              rows={4}
              class="w-full rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-100"
              placeholder="e.g. 2 lemons&#10;1 lb ground beef"
            />
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={importList}
                class="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Import list
              </button>
              <Show when={importStatus()}>
                <span
                  class={`text-xs text-gray-500 dark:text-gray-400 transition-opacity duration-300 ${
                    importStatusVisible() ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {importStatus()}
                </span>
              </Show>
            </div>
          </div>
        </div>

        <div class="mt-10 flex justify-between">
          <A href="/" class="text-blue-500 dark:text-blue-400">
            ← Back
          </A>
          <button onClick={clearChecked} class="text-red-500 dark:text-red-400">
            Clear checked items
          </button>
        </div>
      </div>
    </div>
  );
}
