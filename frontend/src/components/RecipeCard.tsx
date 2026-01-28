import { A } from '@solidjs/router';
import type { RecipeListItem } from '../lib/types';
import { API_BASE } from "../lib/config.ts";

interface Props {
    recipe: RecipeListItem;
}

export default function RecipeCard(props: Props) {
    const { title, description, prepTime, cookTime } = props.recipe;
    return (
        <A
            href={`/recipe/${props.recipe.slug}`}
            class="block bg-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 overflow-hidden"
        >
            {/* Recipe Image */}
            {props.recipe.image && (
                <img
                    src={`${API_BASE}${props.recipe.image}`}
                    alt={props.recipe.title}
                    class="w-full aspect-[3/2] object-cover"
                />
            )}

            {/* Card content */}
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2 line-clamp-2">{title}</h3>
                {description && (
                    <p class="text-sm text-gray-600 mb-4 line-clamp-3">
                        {description}
                    </p>
                )}
                {/* Prep & Cook Time */}
                <div class="text-sm text-gray-500 mb-2 flex gap-4">
                    <span>Prep: {prepTime} min</span>
                    <span>Cook: {cookTime} min</span>
                </div>
            </div>
        </A>
    );
};