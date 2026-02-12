import { render, screen } from '@solidjs/testing-library';
import LoadingSpinner from '../LoadingSpinner.tsx';

it('renders loading spinner', () => {
  render(() => <LoadingSpinner />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});
