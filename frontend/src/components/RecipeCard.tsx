import { A } from '@solidjs/router';
import { Show } from 'solid-js';
import type { RecipeListItem } from '../lib/types';

interface Props {
  recipe: RecipeListItem;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (slug: string) => void;
}

export default function RecipeCard(props: Props) {
  const cardClasses =
    'block bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-md transition-all duration-200 overflow-hidden border-2';

  return (
    <Show
      when={props.isSelectable}
      fallback={
        <A
          href={`/recipe/${props.recipe.slug}`}
          class={`${cardClasses} border-transparent dark:border-slate-800 hover:shadow-xl transform hover:-translate-y-1`}
        >
          {/* Recipe Image */}
          {props.recipe.image && (
            <img
              src={`api${props.recipe.image}`}
              alt={props.recipe.title}
              class="w-full aspect-3/2 object-cover"
            />
          )}
          {/* Card content */}
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2 line-clamp-2">{props.recipe.title}</h3>
            {props.recipe.description && (
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {props.recipe.description}
              </p>
            )}
            {/* Prep & Cook Time */}
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-2 flex gap-4">
              <span>Prep: {props.recipe.prepTime} min</span>
              <span>Cook: {props.recipe.cookTime} min</span>
            </div>
          </div>
        </A>
      }
    >
      <button
        type="button"
        onClick={() => props.onToggleSelect?.(props.recipe.slug)}
        class={`${cardClasses} text-left w-full ${props.isSelected ? 'border-blue-500 dark:border-blue-400 shadow-xl -translate-y-1' : 'border-transparent dark:border-slate-800 hover:shadow-xl hover:-translate-y-1'}`}
      >
        {props.recipe.image && (
          <img
            src={`api${props.recipe.image}`}
            alt={props.recipe.title}
            class="w-full aspect-3/2 object-cover"
          />
        )}

        <div class="p-6">
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-xl font-semibold mb-2 line-clamp-2">{props.recipe.title}</h3>
            <span
              class={`text-xs font-medium px-2 py-1 rounded ${props.isSelected ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-300'}`}
            >
              {props.isSelected ? 'Selected' : 'Tap to select'}
            </span>
          </div>
          {props.recipe.description && (
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {props.recipe.description}
            </p>
          )}
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-2 flex gap-4">
            <span>Prep: {props.recipe.prepTime} min</span>
            <span>Cook: {props.recipe.cookTime} min</span>
          </div>
        </div>
      </button>
    </Show>
  );
}
