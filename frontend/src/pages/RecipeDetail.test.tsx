import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import RecipeDetail from './RecipeDetail';
import type { Recipe } from '../lib/types';

// mock the api module
import * as api from '../lib/api';
vi.mock('../lib/api', () => ({
  getRecipe: vi.fn(),
  rateRecipe: vi.fn(),
  RateLimitError: class RateLimitError extends Error {
    retryAfterMs: number;
    constructor(retryAfterMs: number) {
      super('Rate limit exceeded');
      this.retryAfterMs = retryAfterMs;
    }
  },
}));

// mock the router before importing the component
vi.mock('@solidjs/router', () => ({
  useParams: () => ({ slug: 'miso-salmon' }),
  A: (props: any) => <a {...props} />,
  useNavigate: () => () => {},
}));

const mockRecipe: Recipe = {
  slug: 'miso-salmon',
  title: 'Miso Salmon',
  description: 'Description',
  image: '/img.jpg',
  estimatedCost: 25,
  prepTime: 15,
  cookTime: 20,
  ingredients: ['Salmon', 'Miso paste'],
  instructions: ['Mix', 'Bake'],
  tips: ['Serve hot'],
  ratingAverage: 3.5,
  ratingCount: 2,
};

describe('RecipeDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders recipe detail page', async () => {
    (api.getRecipe as vi.Mock).mockResolvedValue(mockRecipe);
    render(() => <RecipeDetail />);

    await waitFor(async () => {
      expect(screen.getByText('Miso Salmon')).toBeInTheDocument();
      expect(screen.getByText('Bake')).toBeInTheDocument();
    });
  });

  it('submits a rating and updates the summary', async () => {
    (api.getRecipe as vi.Mock).mockResolvedValue(mockRecipe);
    (api.rateRecipe as vi.Mock).mockResolvedValue({
      ratingAverage: 4,
      ratingCount: 3,
    });

    render(() => <RecipeDetail />);

    await screen.findByText('Miso Salmon');

    const button = screen.getByRole('button', { name: /rate 5 stars/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.rateRecipe).toHaveBeenCalledWith('miso-salmon', 5);
      expect(screen.getByText('4.0 (3 ratings)')).toBeInTheDocument();
    });
  });

  it('disables rating when recently rated', async () => {
    (api.getRecipe as vi.Mock).mockResolvedValue(mockRecipe);
    const cooldownUntil = Date.now() + 30_000;
    localStorage.setItem('recipe-rating:miso-salmon', String(cooldownUntil));

    render(() => <RecipeDetail />);

    await screen.findByText('Miso Salmon');

    const button = screen.getByRole('button', { name: /rate 5 stars/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(api.rateRecipe).not.toHaveBeenCalled();
  });

  it('shows a rate limit message when the API rejects', async () => {
    (api.getRecipe as vi.Mock).mockResolvedValue(mockRecipe);
    (api.rateRecipe as vi.Mock).mockRejectedValue(new api.RateLimitError(20_000));

    render(() => <RecipeDetail />);

    await screen.findByText('Miso Salmon');

    const button = screen.getByRole('button', { name: /rate 5 stars/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/please wait 20s to rate again/i)).toBeInTheDocument();
    });
  });

  it('shows an error message when rating fails', async () => {
    (api.getRecipe as vi.Mock).mockResolvedValue(mockRecipe);
    (api.rateRecipe as vi.Mock).mockRejectedValue(new Error('nope'));

    render(() => <RecipeDetail />);

    await screen.findByText('Miso Salmon');

    const button = screen.getByRole('button', { name: /rate 5 stars/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/rating failed\. please try again\./i)).toBeInTheDocument();
    });
  });
});
