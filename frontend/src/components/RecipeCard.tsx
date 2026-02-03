import { A } from '@solidjs/router';
import type { RecipeListItem } from './RecipeListItem.tsx';
import { API_BASE } from '../lib/config.ts';
import { useShoppingList } from "../context/ShoppingListContext.tsx";

interface Props {
  recipe: RecipeListItem;
  selectable?: boolean;
}

export default function RecipeCard(props: Props) {
  const { selected, toggle } = useShoppingList();
  const isSelected = () =>
    selected().has(props.recipe.slug);
  const onToggle = (e: MouseEvent) => {
    e.preventDefault(); // prevent navigation when selecting
    toggle(props.recipe.slug);
  };

  return (
    <A
      href={`/recipe/${props.recipe.slug}`}
      onClick={props.selectable ? onToggle : undefined}
      class={`relative block bg-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 overflow-hidden
        ${props.selectable && isSelected() ? 'ring-4 ring-blue-500' : ''}
      `}
    >
      {/* Recipe Image */}
      {props.recipe.image && (
        <img
          src={`api${props.recipe.image}`}
          alt={props.recipe.title}
          class="w-full aspect-3/2 object-cover"
        />
      )}

      {/* Selection Checkbox*/}
      {props.selectable && (
        <div class="absolute top-3 right-3 z-10">
          <input
          type="checkbox"
          checked={isSelected()}
          onClick={onToggle}
          class="w-5 h-5"
          />
        </div>
      )}

      {/* Card content */}
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-2 line-clamp-2">
          {props.recipe.title}
        </h3>
        {props.recipe.description && (
          <p class="text-sm text-gray-600 mb-4 line-clamp-3">
            {props.recipe.description}
          </p>
        )}
        {/* Prep & Cook Time */}
        <div class="text-sm text-gray-500 mb-2 flex gap-4">
          <span>Prep: {props.recipe.prepTime} min</span>
          <span>Cook: {props.recipe.cookTime} min</span>
        </div>
      </div>
    </A>
  );
}
