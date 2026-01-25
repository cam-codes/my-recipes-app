# My Recipes App

A full-stack recipe browsing application built with **Deno** (backend) + **SolidJS** (frontend).

Browse a collection of recipes stored as markdown files with YAML front-matter, view details, and see associated images — all served locally or deployable.

## Tech Stack

### Backend (Deno)
- **Runtime**: Deno 2.x
- **Web framework**: Oak v12.6.1
- **YAML parsing**: @std/front-matter@^1.0.9
- **File system**: Deno.readDir / Deno.readTextFile
- **Testing**: Deno.test + std/testing/asserts

### Frontend (SolidJS + Vite)
- **Framework**: SolidJS 1.9.x
- **Routing**: @solidjs/router
- **Testing**: Vitest + @solidjs/testing-library
- **Build tool**: Vite + vite-plugin-solid
- **Styling**: Tailwind CSS (via @tailwindcss/vite)

### Package Manager
- **Yarn Berry** (v4.12.0) with `nodeLinker: node-modules` (required for Vite/Vitest compatibility)

## Project Structure
my-recipes-app/
├── backend/
│   ├── main.ts               # Core app logic (createApp, routes)
│   ├── server.ts             # Entry point (listens on port 8000)
│   ├── utils/
│   │   ├── recipe.ts         # normalizeRecipe (title from slug, defaults, etc.)
│   │   └── logger.ts         # Structured JSON logger with colors
│   ├── types.ts              # Recipe front-matter types
│   ├── lib/
│   │   └── api.ts            # Frontend-facing fetch helpers (optional)
│   └── tests/
│       ├── main_test.ts      # Route tests, normalization, image serving
│       └── server_test.ts    # Server startup smoke tests
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx      # Recipe list with createResource + loading state
│   │   ├── components/
│   │   │   ├── RecipeCard.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── lib/
│   │       ├── api.ts        # getRecipes() wrapper
│   │       └── config.ts     # API_BASE
│   ├── tests/
│   │   └── Home.test.tsx     # Home page rendering + loading → success
│   ├── vite.config.ts
│   └── package.json
├── recipes/                      # Live recipes (served by backend)
│   ├── miso-salmon/
│   │   ├── recipe.md
│   │   └── salmon.jpg
│   └── ... (other recipes)
├── tests/fixtures/recipes/       # Test fixtures (used in backend tests)
└── README.md


## Features

### Backend
- `GET /recipes` → list of all recipes (normalized)
- `GET /recipes/:slug` → single recipe details
- `GET /recipes/:slug/image.jpg` → static image serving
- Automatic title generation from slug (kebab-case → Title Case)
- Default values for missing fields (description, times, cost, empty arrays)
- Graceful skipping of invalid/broken recipes with structured logging
- CORS headers for localhost:5173 dev server

### Frontend
- Responsive recipe grid with Tailwind
- Loading spinner while fetching
- Recipe cards with image, title, description, prep/cook time
- Links to detail pages via `<A>` from `@solidjs/router`
- Clean, modern UI

## Development Setup

### Backend
```bash
cd backend

# Run server
deno task start
# → http://localhost:8000

# Run tests
deno task test

# Tests with coverage
deno task test:coverage
```

### Frontend
```bash
cd frontend

# Dev server
yarn dev
# → http://localhost:5173

# Run tests
yarn test

# Tests with coverage
yarn test:coverage
```

## Adding a New Recipe
Create a folder in recipes/ (or tests/fixtures/recipes/ for tests):
```
recipes/my-new-recipe/
├── recipe.md
└── image.jpg (optional)
```
Example recipe.md:
```markdown
---
title: My New Recipe
description: An amazing dish you'll love
prepTime: 15
cookTime: 30
estimatedCost: 12
ingredients:
  - 2 cups flour
  - 1 tsp salt
instructions:
  - Mix everything
  - Bake at 350°F
tips:
  - Don't overmix!
---

Full instructions in markdown...
```
Made with ❤️ by Cam in Anna, Texas