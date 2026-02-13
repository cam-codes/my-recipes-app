import { createSignal } from 'solid-js';
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import type { Recipe } from '../lib/types';
import { useRecipeRating } from './useRecipeRating';
import makeRecipe from '../test/setup';

import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  rateRecipe: vi.fn(),
  RateLimitError: class RateLimitError extends Error {
    retryAfterMs: number;
    constructor(retryAfterMs: number) {
      super('Rate limit exceeded');
      this.retryAfterMs = retryAfterMs;
    }
  },
}));

const Harness = (props: { slug?: string; recipe?: Recipe }) => {
  const [slug] = createSignal(props.slug);
  const [recipe] = createSignal(props.recipe);
  const { ratingAverage, ratingCount, ratingMessage, isCoolingDown, handleRate } =
    useRecipeRating(slug, recipe);

  return (
    <div>
      <div data-testid="average">{ratingAverage()}</div>
      <div data-testid="count">{ratingCount()}</div>
      <div data-testid="message">{ratingMessage()}</div>
      <div data-testid="cooling">{String(isCoolingDown())}</div>
      <button type="button" onClick={() => handleRate(5)}>
        Rate
      </button>
    </div>
  );
};

describe('useRecipeRating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes rating values from the recipe', async () => {
    const recipe = makeRecipe({ ratingAverage: 3.5, ratingCount: 2 });
    render(() => <Harness slug="miso-salmon" recipe={recipe} />);

    await waitFor(() => {
      expect(screen.getByTestId('average')).toHaveTextContent('3.5');
      expect(screen.getByTestId('count')).toHaveTextContent('2');
    });
  });

  it('detects cooldown state from localStorage', async () => {
    localStorage.setItem('recipe-rating:miso-salmon', String(Date.now() + 30_000));
    render(() => <Harness slug="miso-salmon" recipe={makeRecipe()} />);

    await waitFor(() => {
      expect(screen.getByTestId('cooling')).toHaveTextContent('true');
    });
  });

  it('updates rating summary after a successful submission', async () => {
    (api.rateRecipe as vi.Mock).mockResolvedValue({
      ratingAverage: 4,
      ratingCount: 3,
    });

    render(() => <Harness slug="miso-salmon" recipe={makeRecipe()} />);

    fireEvent.click(screen.getByRole('button', { name: /rate/i }));

    await waitFor(() => {
      expect(api.rateRecipe).toHaveBeenCalledWith('miso-salmon', 5);
      expect(screen.getByTestId('average')).toHaveTextContent('4');
      expect(screen.getByTestId('count')).toHaveTextContent('3');
      expect(screen.getByTestId('message')).toHaveTextContent('Thanks for rating!');
      expect(localStorage.getItem('recipe-rating:miso-salmon')).not.toBeNull();
    });
  });

  it('handles rate limit errors', async () => {
    (api.rateRecipe as vi.Mock).mockRejectedValue(new api.RateLimitError(20_000));

    render(() => <Harness slug="miso-salmon" recipe={makeRecipe()} />);

    fireEvent.click(screen.getByRole('button', { name: /rate/i }));

    await waitFor(() => {
      expect(screen.getByTestId('message')).toHaveTextContent('Please wait 20s to rate again.');
      expect(screen.getByTestId('cooling')).toHaveTextContent('true');
      expect(localStorage.getItem('recipe-rating:miso-salmon')).not.toBeNull();
    });
  });

  it('handles generic errors', async () => {
    (api.rateRecipe as vi.Mock).mockRejectedValue(new Error('nope'));

    render(() => <Harness slug="miso-salmon" recipe={makeRecipe()} />);

    fireEvent.click(screen.getByRole('button', { name: /rate/i }));

    await waitFor(() => {
      expect(screen.getByTestId('message')).toHaveTextContent(
        'Rating failed. Please try again.',
      );
    });
  });
});
