import { createEffect, createSignal } from 'solid-js';
import type { Recipe } from '../lib/types';
import { rateRecipe, RateLimitError } from '../lib/api';

const RATING_COOLDOWN_MS = 30_000;

type RatingSource = () => Recipe | undefined;
type SlugSource = () => string | undefined;

export const useRecipeRating = (slugSource: SlugSource, recipeSource: RatingSource) => {
  const [ratingAverage, setRatingAverage] = createSignal(0);
  const [ratingCount, setRatingCount] = createSignal(0);
  const [ratingMessage, setRatingMessage] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [cooldownUntil, setCooldownUntil] = createSignal<number | null>(null);

  createEffect(() => {
    const data = recipeSource();
    if (data) {
      setRatingAverage(data.ratingAverage ?? 0);
      setRatingCount(data.ratingCount ?? 0);
    }
  });

  createEffect(() => {
    const slug = slugSource();
    if (!slug) {
      setCooldownUntil(null);
      return;
    }
    const stored = localStorage.getItem(`recipe-rating:${slug}`);
    if (!stored) {
      setCooldownUntil(null);
      return;
    }
    const until = Number(stored);
    setCooldownUntil(Number.isNaN(until) ? null : until);
  });

  const isCoolingDown = () => {
    const until = cooldownUntil();
    return until !== null && Date.now() < until;
  };

  const setCooldown = (slug: string, ms: number) => {
    const until = Date.now() + ms;
    setCooldownUntil(until);
    localStorage.setItem(`recipe-rating:${slug}`, String(until));
  };

  const handleRate = async (rating: number) => {
    const slug = slugSource();
    if (!slug || isSubmitting()) return;
    if (isCoolingDown()) {
      setRatingMessage('Please wait before rating again.');
      return;
    }

    setIsSubmitting(true);
    setRatingMessage('');
    try {
      const summary = await rateRecipe(slug, rating);
      setRatingAverage(summary.ratingAverage);
      setRatingCount(summary.ratingCount);
      setRatingMessage('Thanks for rating!');
      setCooldown(slug, RATING_COOLDOWN_MS);
    } catch (err) {
      if (err instanceof RateLimitError) {
        const retryMs = err.retryAfterMs || RATING_COOLDOWN_MS;
        setCooldown(slug, retryMs);
        setRatingMessage(`Please wait ${Math.ceil(retryMs / 1000)}s to rate again.`);
      } else {
        setRatingMessage('Rating failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ratingAverage,
    ratingCount,
    ratingMessage,
    isSubmitting,
    isCoolingDown,
    handleRate,
  };
};
