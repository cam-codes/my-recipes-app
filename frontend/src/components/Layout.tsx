import type { JSX } from 'solid-js';
import { Show, createResource } from 'solid-js';
import { getBuildInfo } from '../lib/api';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout(props: LayoutProps) {
  const [buildInfo] = createResource(getBuildInfo);

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <header class="bg-white shadow-sm print:hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div class="flex justify-between items-center">
            {/* Left: Site title */}
            <h1 class="text-3xl font-bold text-gray-900">
              <a href="/" class="hover:text-blue-700 transition">
                Family Recipes
              </a>
            </h1>

            {/* Right Side Header: GitHub */}
            <div class="flex items-center space-x-8">
              <a
                href="https://github.com/cam-codes/my-recipes-app"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition"
              >
                <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Source on GitHub
              </a>

              {/* Right Side Header: Build Info */}
              <div class="relative inline-block text-left">
                <button
                  type="button"
                  class="hidden sm:block text-xs text-gray-500 hover:text-gray-700 font-mono transition"
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    const dropdown = btn.nextElementSibling as HTMLButtonElement;
                    dropdown.classList.toggle('hidden');

                    // close on outside click
                    const close = (ev: MouseEvent) => {
                      if (
                        !btn.contains(ev.target as Node) &&
                        !dropdown.contains(ev.target as Node)
                      ) {
                        dropdown.classList.toggle('hidden');
                        document.removeEventListener('click', close);
                      }
                    };
                    if (!dropdown.classList.contains('hidden')) {
                      setTimeout(() => document.addEventListener('click', close), 0);
                    }
                  }}
                >
                  Build Info ▼
                </button>
                <Show when={buildInfo()}>
                  {(info) => {
                    const commit = info().commit;
                    const tag = info().tag;
                    const compareUrl = info().compareUrl;
                    const shortCommit = commit.slice(0, 7);
                    const isRelease = tag !== '';

                    // if it's a release, link to release notes
                    // if it's not a release, link to compare url from last release to latest commit
                    // default to repo home
                    const githubUrl = isRelease
                      ? `https://github.com/cam-codes/my-recipes-app/releases/tag/${tag}`
                      : commit !== 'unknown'
                        ? `${compareUrl}`
                        : 'https://github.com/cam-codes/my-recipes-app';

                    return (
                      <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50 hidden ring-1 ring-black ring-opacity-5">
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener"
                          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => e.stopPropagation()} // prevent closing on click
                        >
                          {isRelease ? (
                            <>
                              Release: <span class="font-mono">{tag}</span>
                            </>
                          ) : (
                            <>
                              Commit: <span class="font-mono">{shortCommit}</span>
                            </>
                          )}
                        </a>
                      </div>
                    );
                  }}
                </Show>
                <Show when={buildInfo.loading}>
                  <p class="text-sm text-gray-400 font-mono">loading...</p>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main class="flex-1">{props.children}</main>
    </div>
  );
}
