# My Recipes App

A full-stack recipe + resume web app with a **Deno/Oak backend** and a **SolidJS/Vite frontend**.

The app serves recipe data from Markdown front matter, renders recipe detail pages, exposes build metadata, and includes a dedicated resume page.

---

## What the app does

- Browse all recipes on the home page.
- Open recipe detail pages with ingredients, instructions, tips, timing, and estimated cost.
- View a resume page sourced from Markdown front matter.
- Surface deployment/build metadata from the backend (`commit`, `tag`, compare URL).
- Optionally track page views with Google Analytics (build-time opt-in).

---

## Architecture

- **Backend**: Deno + Oak HTTP API.
- **Frontend**: SolidJS SPA (Vite build), served by Nginx in Docker.
- **Data source**:
  - `recipes/<slug>/recipe.md` (+ optional `image.jpg`)
  - `resume/resume.md`
- **Container orchestration**: Docker Compose with local, staging, and production overlays.

---

## Repository structure

```text
my-recipes-app/
├── backend/
│   ├── main.ts                  # API routes and app wiring
│   ├── server.ts                # runtime entrypoint
│   ├── types.ts                 # recipe/resume TypeScript types
│   ├── utils/recipe.ts          # recipe normalization logic
│   ├── tests/                   # Deno tests (API + parsing behavior)
│   ├── deno.json                # backend tasks/imports
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/          # layout/cards/resume display/spinner
│   │   ├── pages/               # Home, RecipeDetail, ResumePage
│   │   ├── lib/                 # API client, analytics, route tracking, types
│   │   └── test/                # frontend test setup + mocks
│   ├── e2e/                     # Playwright tests
│   ├── nginx.conf
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── package.json
│   └── Dockerfile
├── recipes/                     # recipe content (folder per recipe)
├── resume/                      # resume markdown data
├── docker-compose.yml           # base services
├── docker-compose.local.yml     # local ports/volumes
├── docker-compose.staging.yml   # staging image + ports
├── docker-compose.prod.yml      # production image + ports
├── dev-up.sh                    # build+run local stack with build metadata args
├── ci-up.sh                     # run stack from already-built images
├── package.json                 # root workspace/tooling scripts
└── .github/workflows/           # CI/CD/release automation
```

---

## Backend details

### Runtime and dependencies

- Deno `2.6.x`
- Oak `v12.6.1`
- `@std/front-matter` for YAML front matter extraction

### API endpoints

| Endpoint                   | Method | Description                                                       |
| -------------------------- | ------ | ----------------------------------------------------------------- |
| `/health`                  | `GET`  | Health check (`{ status: "OK" }`).                                |
| `/recipes`                 | `GET`  | Returns normalized recipe list from `recipes/*/recipe.md`.        |
| `/recipes/:slug`           | `GET`  | Returns one normalized recipe by slug.                            |
| `/recipes/:slug/image.jpg` | `GET`  | Serves recipe image from filesystem if present.                   |
| `/resume`                  | `GET`  | Returns parsed resume front matter from `resume/resume.md`.       |
| `/build-info`              | `GET`  | Returns `gitCommit`, `gitTag`, and compare URL for UI build info. |

### Normalization behavior

For recipes, the backend normalizes missing fields with sensible defaults:

- `title`: generated from slug if omitted
- `description`: `""`
- `prepTime`, `cookTime`, `estimatedCost`: `0`
- `ingredients`, `instructions`, `tips`: `[]`
- `image`: always exposed as `/recipes/<slug>/image.jpg`

Invalid recipe folders/files are skipped in the list endpoint instead of crashing the app.

---

## Frontend details

### UI and routing

- Routes:
  - `/` (recipe listing)
  - `/recipe/:slug` (recipe details)
  - `/resume` (resume page)
- Build-info dropdown in header links to release notes or commit compare URL.
- Loading states for async data fetches.

### Analytics

Analytics is **disabled by default** and enabled only at build-time when:

- `VITE_ANALYTICS_ENABLED=true`
- `VITE_GA_MEASUREMENT_ID` is set

When enabled, page views are tracked via route changes.

---

## Dependencies and toolchain

### Root

- Yarn Berry `4.12.0` workspaces
- ESLint + Prettier + TypeScript-ESLint

### Frontend

- SolidJS `1.9.x`
- `@solidjs/router`
- Vite `7.x`
- Tailwind CSS `4.x`
- Vitest + Testing Library
- Playwright (E2E)

### Backend

- Deno task runner (`deno task`)
- Deno test runner (`deno test`)

---

## Local development

### Prerequisites

- **Node** `24.13.0` (for workspace/frontend toolchain)
- **Yarn** `4.12.0` (via Corepack recommended)
- **Deno** `2.x`
- Optional: **Docker** + Docker Compose

### Install dependencies

```bash
yarn install
```

### Run backend (non-Docker)

```bash
cd backend
deno task start
# http://localhost:3000
```

### Run frontend (non-Docker)

```bash
cd frontend
yarn dev
# http://localhost:5173
```

The frontend expects backend APIs under `/api/*` (via dev/proxy or containerized Nginx path mapping).

---

## Testing and quality checks

### Backend

```bash
cd backend
deno task test
deno task test:coverage
deno task lint:check
deno task fmt:check
```

### Frontend

```bash
cd frontend
yarn test
yarn test:coverage
yarn lint:check
yarn format:check
```

### Root tooling

```bash
yarn lint:check
yarn format:check
```

---

## Docker usage

### Local stack (build + run)

```bash
./dev-up.sh
```

This builds both services and injects build metadata (`GIT_COMMIT`, `GIT_TAG`, `LATEST_TAG`) plus local analytics defaults.

### Run from pre-built images

```bash
./ci-up.sh
```

### Compose overlays

- Base: `docker-compose.yml`
- Local: `docker-compose.local.yml`
- Staging: `docker-compose.staging.yml`
- Production: `docker-compose.prod.yml`

---

## Content authoring

### Add a recipe

Create a new folder under `recipes/`:

```text
recipes/my-new-recipe/
├── recipe.md
└── image.jpg   # optional but expected by default image path
```

Example `recipe.md`:

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
```

### Update resume data

Edit `resume/resume.md` front matter fields used by the `/resume` endpoint and frontend resume renderer.

---

Made with ❤️ in Anna, Texas.
