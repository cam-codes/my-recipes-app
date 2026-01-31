import { useShoppingList } from "../context/ShoppingListContext.tsx";
import { A } from '@solidjs/router';

export interface RecipeListItem {
  slug: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  image: string;
}

function RecipeListItem(props) {
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

  return props.selectionEnabled
    ? content
    : <A href={`/recipe/${props.recipe.slug}`}>{content}</A>;
}
