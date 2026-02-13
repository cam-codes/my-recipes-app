import { createContext, useContext, createSignal, type JSX } from 'solid-js';
type ShoppingListContextValue = {
  selected: () => Set<string>;
  toggle: (slug: string) => void;
  clear: () => void;
};
const ShoppingListContext = createContext<ShoppingListContextValue>();
export function ShoppingListProvider(props: { children: JSX.Element }) {
  const [selected, setSelected] = createSignal<Set<string>>(new Set());
  const toggle = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };
  const clear = () => setSelected(new Set<string>());
  return (
    <ShoppingListContext.Provider value={{ selected, toggle, clear }}>
      {props.children}
    </ShoppingListContext.Provider>
  );
}
export function useShoppingList() {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) {
    throw new Error('useShoppingList must be used within ShoppingListProvider');
  }
  return ctx;
}
