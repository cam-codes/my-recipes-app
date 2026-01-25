import { createResource, Show, createEffect } from 'solid-js';
import { getRecipes } from '../lib/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
    const [recipes] = createResource(getRecipes);

    return (
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Page Heading */}
            <h1 class="text-4xl font-extrabold text-center mb-8 text-gray-900">
                Delicious Recipes
            </h1>
            <p class="text-center text-gray-500 mb-12">
                Browse our collection of tasty recipes and find your next favorite meal!
            </p>

            {/* Recipes Grid */}
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
                        <p class="text-center text-gray-500 py-20 text-lg">
                            No recipes found.
                        </p>
                    }
                >
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recipes()!.map((recipe) => (
                            <RecipeCard recipe={recipe} />
                        ))}
                    </div>
                </Show>
            </Show>
        </div>
    );
}
