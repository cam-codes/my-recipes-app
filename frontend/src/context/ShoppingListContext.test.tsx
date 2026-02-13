import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { ShoppingListProvider, useShoppingList } from './ShoppingListContext';

const ContextConsumer = () => {
  const { selected, toggle, clear } = useShoppingList();
  return (
    <div>
      <span data-testid="count">{selected().size}</span>
      <button type="button" onClick={() => toggle('recipe-a')}>
        Toggle A
      </button>
      <button type="button" onClick={clear}>
        Clear
      </button>
    </div>
  );
};

describe('ShoppingListContext', () => {
  it('toggles selections and clears them', () => {
    render(() => (
      <ShoppingListProvider>
        <ContextConsumer />
      </ShoppingListProvider>
    ));

    expect(screen.getByTestId('count')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: 'Toggle A' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Toggle A' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: 'Toggle A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
