import { createResource, onMount, Show } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { getRecipe } from '../lib/api';
import { SolidMarkdown } from 'solid-markdown';
import LoadingSpinner from '../components/LoadingSpinner';
import RatingStars from '../components/RatingStars';
import { useRecipeRating } from '../hooks/useRecipeRating';

export default function RecipeDetail() {
  const params = useParams();
  const [recipe] = createResource(() => params.slug, getRecipe);
  const {
    ratingAverage,
    ratingCount,
    ratingMessage,
    isSubmitting,
    isCoolingDown,
    handleRate,
  } = useRecipeRating(() => params.slug, () => recipe());
  onMount(() => {
    document.title = 'Cook with Cam';
  });

  return (
    <div class="max-w-4xl mx-auto px-4 py-8">
      <A href="/" class="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">
        ← Back to recipes
      </A>

      <Show
        when={!recipe.loading}
        fallback={
          <div class="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        }
      >
        <Show
          when={recipe()}
          fallback={
            <p class="text-center text-red-600 dark:text-red-400 py-10">Recipe not found.</p>
          }
        >
          <article class="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8">
            {/* Hero Image */}
            {recipe()!.image && (
              <img
                src={`/api${recipe()!.image}`}
                alt={recipe()!.title}
                class="w-full aspect-3/2 object-cover rounded-xl mb-6 shadow-md"
              />
            )}
            <h1 class="text-4xl font-bold mb-4">{recipe()!.title}</h1>

            <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
              <RatingStars
                average={ratingAverage()}
                count={ratingCount()}
                onRate={handleRate}
                disabled={isSubmitting() || isCoolingDown()}
              />
              <Show when={ratingMessage()}>
                <p class="text-xs text-gray-500 dark:text-gray-400">{ratingMessage()}</p>
              </Show>
            </div>

            <div class="grid grid-cols-3 gap-6 mb-8 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <span class="font-semibold">Prep:</span> {recipe()!.prepTime} min
              </div>
              <div>
                <span class="font-semibold">Cook:</span> {recipe()!.cookTime} min
              </div>
              <div>
                <span class="font-semibold">Cost:</span> ${recipe()!.estimatedCost.toFixed(2)}
              </div>
            </div>

            <h2 class="text-2xl font-semibold mb-4">Ingredients</h2>
            <ul class="list-disc pl-6 mb-8 space-y-2">
              {recipe()!.ingredients.map((ing) => (
                <li>{ing}</li>
              ))}
            </ul>

            <h2 class="text-2xl font-semibold mb-4">Instructions</h2>
            <ol class="list-decimal pl-6 mb-8 space-y-2">
              {recipe()!.instructions.map((step) => (
                <li>
                  <SolidMarkdown>{step}</SolidMarkdown>
                </li>
              ))}
            </ol>

            <h2 class="text-2xl font-semibold mb-4">Tips</h2>
            <ul class="list-disc pl-6 mb-8 space-y-2">
              {recipe()!.tips.map((tip) => (
                <li>
                  <SolidMarkdown>{tip}</SolidMarkdown>
                </li>
              ))}
            </ul>
          </article>
        </Show>
      </Show>

      <A href="/" class="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">
        ← Back to recipes
      </A>
    </div>
  );
}
