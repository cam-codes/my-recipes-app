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
```
my-recipes-app/
├── backend/
│   ├── main.ts               # Core app logic (createApp, routes)
│   ├── server.ts             # Entry point (listens on port 3000)
│   ├── utils/
│   │   ├── recipe.ts         # normalizeRecipe (title from slug, defaults, etc.)
│   ├── types.ts              # Recipe front-matter types
│   └── tests/
│       ├── main_test.ts      # Route tests, normalization, image serving
│       └── server_test.ts    # Server startup smoke tests
│   ├── utils/
│   │   ├── recipe.ts         # normalizeRecipe (title from slug, defaults, etc.)
│   │   └── logger.ts         # Structured JSON logger with colors
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx              # Recipe list with createResource + loading state
│   │   │   └── RecipeDetail.tsx      # Recipe details
│   │   ├── components/
│   │   │   ├── RecipeCard.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── lib/
│   │       ├── api.ts        # getRecipes() wrapper
│   │       └── config.ts     # API_BASE
│   ├── test/
│   │   └── setup.tsx         # Setup tests
│   │   ├── mocks/
│   │       └── api.ts        # Mock Recipe and RecipeListItem for tests
│   ├── vite.config.ts
│   └── package.json
├── recipes/                      # Live recipes (served by backend)
│   ├── miso-salmon/
│   │   ├── recipe.md
│   │   └── salmon.jpg
│   └── ... (other recipes)
├── tests/fixtures/recipes/       # Test fixtures (used in backend tests)
└── README.md
```

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

## Local Development Setup

### Backend
```bash
cd backend

# Run server
deno task start
# → http://localhost:3000

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

## Docker
You can run the backend and frontend together with Docker Compose.

```bash
# build all services
docker-compose build

# run all services (foreground)
docker-compose up

# run in detached mode (background)
docker-compose up -d

# stop all services
docker-compose down
```
### Notes
 - Frontend is available at `http://localhost:5173`
 - Backend is available at `http://localhost:3000`
 - The frontend automatically points to the backend using Docker’s internal hostname (`backend:3000`)

### Key Issue and Solution
> You may encounter build errors in Docker due to Rollup 4’s native optional dependencies not installing reliably via 
> Yarn in container builds. Downgrading Rollup or Vite either breaks builds or introduces CVEs. 
> The clean solution is to keep Vite 7 / Rollup 4 and switch Docker to use npm (npm ci) instead of Yarn, 
> which correctly installs all native dependencies. This makes builds reliable across macOS, Apple Silicon, and Linux 
> cloud environments without changing local development.

Alternatively, you can build front/back ends individually

### Frontend

#### Build and Run

```bash
# build docker image
docker build --no-cache -t my-recipes-frontend ./frontend

# run container
docker run -p 80:80 my-recipes-frontend
```

#### Dockerfile

```dockerfile
# Stage 1: build
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Copy only package files first for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: production image
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Backend

#### Build and Run

```bash
# build docker image
docker build -t my-recipes-backend ./backend

# run container
docker run -p 3000:3000 my-recipes-backend

# run in detached mode
docker run -d -p 3000:3000 my-recipes-backend
```

#### Dockerfile

```dockerfile
# Use official Deno image
FROM denoland/deno:2.6.6

# Set working directory inside container
WORKDIR /app

# Copy backend source code
COPY backend/ ./backend/

# Copy recipes folder
COPY recipes/ ./recipes/

# Cache dependencies
RUN deno cache --lock=backend/deno.lock backend/server.ts

# Expose backend port
EXPOSE 3000

# Set environment variable so backend knows port and recipes folder
ENV BACKEND_PORT=3000
ENV RECIPES_DIR=/app/recipes

# Run server with network + read permissions
CMD ["sh", "-c", "deno run --allow-read=/app/recipes --allow-net --lock=backend/deno.lock backend/server.ts --port=$BACKEND_PORT"]
```

Made with ❤️ by Cam in Anna, Texas
