import { describe, it, expect, vi } from 'vitest';
import { getRecipes, getRecipe, getResume, getBuildInfo } from '../api.ts';
import { mockRecipes, mockRecipe } from '../../test/mocks/api.ts';

const mockFetch = vi.fn(async (input: RequestInfo) => {
  const url = input.toString();

  if (url.endsWith('/recipes')) {
    return new Response(JSON.stringify(mockRecipes), { status: 200 });
  }

  if (url.endsWith('/recipes/miso-salmon')) {
    return new Response(JSON.stringify(mockRecipe), { status: 200 });
  }

  if (url.endsWith('/resume')) {
    return new Response(
      JSON.stringify({
        name: 'Cam',
        email: 'cam@example.com',
        phone: '555-5555',
        linkedin: 'linkedin.com/in/cam',
        summary: 'Summary',
        skills: {},
        experience: [],
        education: [],
        volunteering: [],
      }),
      { status: 200 },
    );
  }

  if (url.endsWith('/build-info')) {
    return new Response(
      JSON.stringify({
        commit: 'abc123',
        tag: 'v1.0.0',
      }),
      { status: 200 },
    );
  }

  return new Response(null, { status: 404 });
}) as unknown as typeof fetch;

beforeEach(() => {
  globalThis.fetch = mockFetch;
});

describe('api', () => {
  it('fetches recipe list', async () => {
    const recipes = await getRecipes();
    expect(recipes).toHaveLength(1);
  });

  it('fetches recipe by slug', async () => {
    const recipe = await getRecipe('miso-salmon');
    expect(recipe.slug).toBe('miso-salmon');
  });

  it("throws 'Failed to fetch recipes' on non-404 error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 })) as any;

    await expect(getRecipes()).rejects.toThrow('Failed to fetch recipe');
  });

  it("throws 'Recipe not found' on 404", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 404 })) as any;

    await expect(getRecipe('does-not-exist')).rejects.toThrow('Recipe not found');
  });

  it("throws 'Failed to fetch recipe' on non-404 error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 })) as any;

    await expect(getRecipe('miso-salmon')).rejects.toThrow('Failed to fetch recipe');
  });

  it('fetches resume data', async () => {
    const resume = await getResume();
    expect(resume.name).toBe('Cam');
    expect(resume.email).toBe('cam@example.com');
  });

  it("throws 'Failed to fetch resume' on error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 })) as any;

    await expect(getResume()).rejects.toThrow('Failed to fetch resume');
  });

  it('fetches build info', async () => {
    const info = await getBuildInfo();
    expect(info.gitCommit).toBe('abc123');
    expect(info.gitTag).toBe('v1.0.0');
  });

  it("throws 'Failed to load build info' on error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 })) as any;

    await expect(getBuildInfo()).rejects.toThrow('Failed to load build info');
  });
});
