import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import RatingStars from './RatingStars';

describe('RatingStars', () => {
  it('shows summary when there are no ratings', () => {
    render(() => <RatingStars average={0} count={0} />);
    expect(screen.getByText('No ratings yet')).toBeInTheDocument();
  });

  it('calls onRate when a star is clicked', () => {
    const onRate = vi.fn();
    render(() => <RatingStars average={2.2} count={5} onRate={onRate} />);

    fireEvent.click(screen.getByRole('button', { name: /rate 4 stars/i }));
    expect(onRate).toHaveBeenCalledWith(4);
  });

  it('disables rating when requested', () => {
    const onRate = vi.fn();
    render(() => <RatingStars average={4.6} count={9} onRate={onRate} disabled />);

    const button = screen.getByRole('button', { name: /rate 5 stars/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onRate).not.toHaveBeenCalled();
  });
});
