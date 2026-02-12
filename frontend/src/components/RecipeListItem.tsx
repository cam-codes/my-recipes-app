import type { RecipeListItem as RecipeListItemType } from '../lib/types';
import { useShoppingList } from '../context/ShoppingListContext';
import { A } from '@solidjs/router';
import { Show } from 'solid-js';

interface Props {
  recipe: RecipeListItemType;
  selectionEnabled?: boolean;
}

export type { RecipeListItemType as RecipeListItem };

export default function RecipeListItem(props: Props) {
  const { toggle, selected } = useShoppingList();

  const content = (
    <div class="recipe-card">
      {props.selectionEnabled && (
        <input
          type="checkbox"
          checked={selected().has(props.recipe.slug)}
          onClick={(e) => {
            e.stopPropagation();
            toggle(props.recipe.slug);
          }}
        />
      )}
      <h2>{props.recipe.title}</h2>
    </div>
  );

  return (
    <Show
      when={props.selectionEnabled}
      fallback={<A href={`/recipe/${props.recipe.slug}`}>{content}</A>}
    >
      {content}
    </Show>
  );
}
