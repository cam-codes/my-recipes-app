import { RecipeFrontMatter } from "../types.ts";
import { Recipe } from "../types.ts";

const toNumber = (v: unknown) =>
  typeof v === "number"
    ? v
    : typeof v === "string"
      ? Number(v) || 0
      : 0;

export function normalizeRecipe(slug: string, attrs: RecipeFrontMatter): Recipe {
  return {
    slug,
    title: attrs.title ??
      slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    description: attrs.description ?? "",
    image: `/recipes/${slug}/image.jpg`,
    prepTime: toNumber(attrs.prepTime),
    cookTime: toNumber(attrs.cookTime),
    estimatedCost: toNumber(attrs.estimatedCost),
    ingredients: Array.isArray(attrs.ingredients) ? attrs.ingredients : [],
    instructions: Array.isArray(attrs.instructions) ? attrs.instructions : [],
    tips: Array.isArray(attrs.tips) ? attrs.tips : [],
  };
}
