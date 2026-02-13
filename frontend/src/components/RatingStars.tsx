import { For, Show } from 'solid-js';

type RatingStarsProps = {
  average: number;
  count: number;
  onRate?: (rating: number) => void;
  disabled?: boolean;
  showSummary?: boolean;
  size?: 'sm' | 'md';
};

const StarIcon = (props: { filled: boolean; class?: string }) => (
  <svg
    class={props.class}
    viewBox="0 0 20 20"
    fill={props.filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.5"
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.157c.969 0 1.371 1.24.588 1.81l-3.363 2.444a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 1.688-1.539 1.118l-3.363-2.444a1 1 0 00-1.176 0l-3.363 2.444c-.783.57-1.838-.197-1.539-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.118 9.382c-.783-.57-.38-1.81.588-1.81h4.157a1 1 0 00.95-.69l1.286-3.955z"
    />
  </svg>
);

export default function RatingStars(props: RatingStarsProps) {
  const roundedAverage = () => Math.round(props.average);
  const summary = () => {
    if (props.count === 0) return 'No ratings yet';
    const formatted = props.average.toFixed(1);
    const label = props.count === 1 ? 'rating' : 'ratings';
    return `${formatted} (${props.count} ${label})`;
  };
  const iconSize = () => (props.size === 'sm' ? 'h-4 w-4' : 'h-5 w-5');

  return (
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1">
        <For each={[1, 2, 3, 4, 5]}>
          {(value) => (
            <Show
              when={props.onRate}
              fallback={
                <span>
                  <StarIcon
                    filled={value <= roundedAverage()}
                    class={`${iconSize()} ${value <= roundedAverage() ? 'text-amber-400 dark:text-amber-300' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                </span>
              }
            >
              <button
                type="button"
                class={`transition ${props.disabled ? 'cursor-not-allowed opacity-60' : 'hover:text-amber-400 dark:hover:text-amber-300'} text-gray-300 dark:text-gray-600`}
                aria-label={`Rate ${value} ${value === 1 ? 'star' : 'stars'}`}
                onClick={() => props.onRate?.(value)}
                disabled={props.disabled}
              >
                <StarIcon
                  filled={value <= roundedAverage()}
                  class={`${iconSize()} ${value <= roundedAverage() ? 'text-amber-400 dark:text-amber-300' : 'text-gray-300 dark:text-gray-600'}`}
                />
              </button>
            </Show>
          )}
        </For>
      </div>
      <Show when={props.showSummary ?? true}>
        <span class="text-xs text-gray-500 dark:text-gray-400">{summary()}</span>
      </Show>
    </div>
  );
}
