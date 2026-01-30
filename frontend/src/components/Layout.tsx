import type { JSX } from 'solid-js';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout(props: LayoutProps) {
  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <header class="bg-white shadow-sm">
        <div class="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-800">My Recipes</h1>
          {/* Add generate button later */}
        </div>
      </header>
      <main class="flex-1">{props.children}</main>
    </div>
  );
}
